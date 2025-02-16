from fastapi import FastAPI, Query, Depends
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware
import iris
import time
import os
import logging
from typing import List
import json
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



app = FastAPI()
model = SentenceTransformer('all-MiniLM-L6-v2')  

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["GET", "HEAD", "POST"],  
    allow_headers=["*"], 
)

username = 'demo'
password = 'demo'
hostname = os.getenv('IRIS_HOSTNAME', 'localhost')
port = '1972' 
namespace = 'USER'
CONNECTION_STRING = f"{hostname}:{port}/{namespace}"

conn = iris.connect(CONNECTION_STRING, username, password)
cursor = conn.cursor()
table_name = "Papers.General_Data"


class InterestRequest(BaseModel):
    user_id: str
    research_interests: List[str]


@app.post("/update-interests")
def update_interests(data: InterestRequest):
    user_id = data.user_id

    delete_sql = f"""DELETE FROM Papers.User_Interests WHERE user_id = ?;"""
    insert_sql = f"""INSERT INTO Papers.User_Interests (user_id, interests) VALUES (?, ?);"""

    cursor.execute(delete_sql, [user_id])  

    for interest in data.research_interests:
        cursor.execute(insert_sql, [user_id, interest]) 

    conn.commit()



@app.api_route('/papers', methods=['GET', 'HEAD'])
def get_papers(user_id: str):
    """
    Fetch papers with semantic search and pagination.
    """

    get_interests = f"""SELECT interests FROM Papers.User_Interests WHERE user_id=?"""
    cursor.execute(get_interests, [user_id])
    user_data = cursor.fetchone()
    
    if not user_data:
        logger.info("NO USER DATA")
        searchVector = model.encode("research", normalize_embeddings=True).tolist() 

    logger.info(f"Fetching papers for interests: {user_data[0]}")

    searchVector = model.encode(user_data[0], normalize_embeddings=True).tolist()


    sql = f"""
        SELECT TOP ? title, topics, abstract, doi, pub_date, authorships,
            VECTOR_DOT_PRODUCT(abstractVector, TO_VECTOR(?)) * 0.5 +
            VECTOR_DOT_PRODUCT(titleVector, TO_VECTOR(?)) * 0.3 +
            VECTOR_DOT_PRODUCT(keywordsVector, TO_VECTOR(?)) * 0.2 AS relevance_score
        FROM {table_name}
        ORDER BY relevance_score DESC
    """

    numberOfResults = 15

    params = [numberOfResults, str(searchVector), str(searchVector), str(searchVector)]
    print(f"Executing SQL")

    cursor.execute(sql, params)

    results = cursor.fetchall()

    return {
        "papers": [
            {
                "title": row[0],
                "topics": row[1],
                "abstract": row[2],
                "doi": row[3],
                "pub_date": row[4],
                "authorships": row[5],
            }
            for row in results
        ]
    }
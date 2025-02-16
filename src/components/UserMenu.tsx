
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCircle, BookmarkIcon, Heart, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UserMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserMenu({ open, onOpenChange }: UserMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/welcome');
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl">
        <div className="flex flex-col space-y-4 p-2">
          <Button
            variant="ghost"
            className="flex items-center justify-start space-x-2 text-lg text-black hover:bg-gray-100 hover:text-black
"
            onClick={() => {
              navigate('/aboutme');
              onOpenChange(false);
            }}
          >
            <UserCircle className="w-5 h-5 text-black" />
            <span>Update Profile</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start space-x-2 text-lg text-black hover:bg-gray-100 hover:text-black
"
            onClick={() => {
              navigate('/saved');
              onOpenChange(false);
            }}
          >
            <BookmarkIcon className="w-5 h-5 text-black" />
            <span>Saved Papers</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start space-x-2 text-lg text-black hover:bg-gray-100 hover:text-black
"
            onClick={() => {
              navigate('/liked');
              onOpenChange(false);
            }}
          >
            <Heart className="w-5 h-5 text-black" />
            <span>Liked Papers</span>
          </Button>
          <Button
            variant="ghost"
            className="flex items-center justify-start space-x-2 text-lg text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

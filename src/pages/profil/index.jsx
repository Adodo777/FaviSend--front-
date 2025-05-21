import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Icons } from "@/assets/icons";
import { useLocation } from "wouter";
import UserProfile from "@/components/UserProfil";
import { useEffect } from "react";

export default function Profile() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!user) {
            setLocation("/auth");
        }
    }, [user, setLocation]);

    if (!user) {
        return (
            <div className="pt-20 pb-16 flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin">
                    <Icons.loader className="h-12 w-12 text-primary" />
                </div>
            </div>
        );
    }

    return (
        <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => setLocation("/")}
                        className="mb-4"
                    >
                        <Icons.arrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
                    </Button>
                    
                    <h1 className="text-3xl font-heading font-bold mb-6">Mon compte</h1>
                    
                    <UserProfile />
                </div>
            </div>
        </div>
    );
}

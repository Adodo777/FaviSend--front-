
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");

  const form = useForm({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      displayName: user?.displayName || "",
      phone: user?.phone || "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (userData) => 
      apiRequest("PUT", `/api/user/update/${user.id}`, userData),
    onSuccess: (response) => {
      response.json().then(data => {
        updateUser(data); // Update the user in the auth context
        queryClient.invalidateQueries({ queryKey: [`/api/user/update/${user.id}`] });
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été mises à jour avec succès.",
        });
        setIsEditing(false);
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de mettre à jour le profil: ${error}`,
      });
    }
  });

  const handleSubmit = (formData) => {
    const userData = {
      ...formData,
      photoURL,
    };
    
    updateProfileMutation.mutate(userData);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    // Upload photo to the server
    const uploadMutation = apiRequest("POST", `/api/user/upload-photo/${user.id}`, formData);
    uploadMutation.then(response => response.json())
      .then(data => {
        setPhotoURL(data.photoURL);
        toast({
          title: "Photo téléchargée",
          description: "Votre photo de profil a été mise à jour.",
        });
      })
      .catch(error => {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: `Impossible de télécharger la photo: ${error}`,
        });
      });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Profil Utilisateur</CardTitle>
        <CardDescription>
          Consultez et mettez à jour vos informations personnelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={photoURL || undefined} alt={user?.displayName || user?.username} />
              <AvatarFallback>
                {user?.displayName?.charAt(0).toUpperCase() || 
                 user?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div>
                <label htmlFor="profile-photo" className="block text-center text-sm font-medium text-gray-600 mb-2">
                  Modifier la photo
                </label>
                <Input
                  id="profile-photo"
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  onChange={handlePhotoUpload}
                />
              </div>
            )}
            <div className="mt-4 text-center">
              <p className="font-semibold">{user?.displayName || user?.username}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              {user?.balance !== undefined && (
                <div className="mt-2 p-2 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-600">Solde</p>
                  <p className="font-semibold">{user?.balance.toFixed(2)} €</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing} 
                            placeholder="Votre prénom" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            disabled={!isEditing} 
                            placeholder="Votre nom" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'affichage</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing} 
                          placeholder="Nom affiché publiquement" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing || !!user?.username} 
                          placeholder="Nom d'utilisateur unique" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing} 
                          placeholder="Votre numéro de téléphone" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && (
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                        Mise à jour en cours...
                      </>
                    ) : (
                      <>
                        <Icons.save className="mr-2 h-4 w-4" />
                        Enregistrer les modifications
                      </>
                    )}
                  </Button>
                )}
              </form>
            </Form>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Icons.pencil className="mr-2 h-4 w-4" />
            Modifier le profil
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            <Icons.x className="mr-2 h-4 w-4" />
            Annuler
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default UserProfile;

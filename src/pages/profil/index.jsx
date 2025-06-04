import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Icons } from "@/assets/icons";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState("");

  // Initialisation de l'URL de la photo quand l'utilisateur est chargé
  useEffect(() => {
    if (user?.photoURL) {
      setPhotoURL(user.photoURL);
    }
  }, [user]);

  // Redirection si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !user) {
      console.log("Redirection vers /auth - utilisateur non connecté");
      setLocation("/auth");
    }
  }, [isLoading, user, setLocation]);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      displayName: "",
      phone: "",
    },
  });

  // Mise à jour des valeurs par défaut du formulaire quand l'utilisateur change
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        displayName: user.displayName || "",
        phone: user.phone || "",
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: (userData) =>
      apiRequest("PUT", `/api/user/update/${user.id}`, userData),
    onSuccess: (data) => {
      updateUser(data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Erreur mise à jour profil:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de mettre à jour le profil : ${error.message || error}`,
      });
    },
  });

  const handleSubmit = (formData) => {
    console.log("Soumission du formulaire:", formData);
    updateProfileMutation.mutate(formData);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Upload de photo:", file.name);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const data = await apiRequest(
        "POST",
        `/api/user/upload-photo/${user.id}`,
        formData,
        {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        }
      );

      if (!data.photoURL) {
        throw new Error("L'URL de la photo est manquante dans la réponse.");
      }

      setPhotoURL(data.photoURL);
      toast({
        title: "Photo téléchargée",
        description: "Votre photo de profil a été mise à jour.",
      });
    } catch (error) {
      console.error("Erreur upload photo:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de télécharger la photo : ${error.message || error}`,
      });
    }
  };

  // Affichage du loader pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Icons.loader className="h-12 w-12 text-blue-600 mx-auto" />
          </div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  // Affichage si l'utilisateur n'est pas défini
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">Redirection en cours...</p>
          <div className="animate-pulse text-sm text-gray-400">
            Vous devez être connecté pour accéder à cette page
          </div>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container principal avec padding-top pour navbar */}
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bouton retour */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="mb-4 hover:bg-gray-100"
            >
              <Icons.arrowLeft className="mr-2 h-4 w-4" /> 
              Retour à l'accueil
            </Button>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Mon compte
            </h1>

            {/* Card principale */}
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardHeader className="bg-white">
                <CardTitle className="text-2xl text-gray-900">
                  Profil Utilisateur
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Consultez et mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>
              
              <CardContent className="bg-white p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Section Avatar */}
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="h-24 w-24 border-4 border-gray-200">
                      <AvatarImage
                        src={photoURL || undefined}
                        alt={user?.displayName || user?.username || "Utilisateur"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                        {user?.displayName?.charAt(0)?.toUpperCase() ||
                          user?.username?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload photo en mode édition */}
                    {isEditing && (
                      <div className="w-full">
                        <label
                          htmlFor="profile-photo"
                          className="block text-center text-sm font-medium text-gray-700 mb-2"
                        >
                          Modifier la photo
                        </label>
                        <Input
                          id="profile-photo"
                          type="file"
                          accept="image/*"
                          className="text-sm w-full"
                          onChange={handlePhotoUpload}
                        />
                      </div>
                    )}
                    
                    {/* Informations utilisateur */}
                    <div className="text-center space-y-2">
                      <p className="font-semibold text-gray-900 text-lg">
                        {user?.displayName || user?.username || "Utilisateur"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {user?.email || "Email non défini"}
                      </p>
                      {user?.balance !== undefined && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Solde
                          </p>
                          <p className="font-bold text-lg text-green-600">
                            {user.balance.toFixed(2)} €
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section Formulaire */}
                  <div className="flex-1">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                      >
                        {/* Prénom et Nom */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700">
                                  Prénom
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditing}
                                    placeholder="Votre prénom"
                                    className={`${
                                      !isEditing 
                                        ? "bg-gray-50 text-gray-600" 
                                        : "bg-white"
                                    }`}
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
                                <FormLabel className="text-gray-700">
                                  Nom
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditing}
                                    placeholder="Votre nom"
                                    className={`${
                                      !isEditing 
                                        ? "bg-gray-50 text-gray-600" 
                                        : "bg-white"
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Nom d'affichage */}
                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">
                                Nom d'affichage
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Nom affiché publiquement"
                                  className={`${
                                    !isEditing 
                                      ? "bg-gray-50 text-gray-600" 
                                      : "bg-white"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Nom d'utilisateur */}
                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">
                                Nom d'utilisateur
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Nom d'utilisateur unique"
                                  className={`${
                                    !isEditing 
                                      ? "bg-gray-50 text-gray-600" 
                                      : "bg-white"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Téléphone */}
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700">
                                Téléphone
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Votre numéro de téléphone"
                                  className={`${
                                    !isEditing 
                                      ? "bg-gray-50 text-gray-600" 
                                      : "bg-white"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Bouton de sauvegarde */}
                        {isEditing && (
                          <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={updateProfileMutation.isLoading}
                          >
                            {updateProfileMutation.isLoading ? (
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
              
              {/* Footer avec boutons d'action */}
              <CardFooter className="bg-gray-50 flex justify-end space-x-2">
                {!isEditing ? (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Icons.pencil className="mr-2 h-4 w-4" />
                    Modifier le profil
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Icons.x className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
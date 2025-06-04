import { useState, useEffect, useCallback } from "react";
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
  const [isUploading, setIsUploading] = useState(false);

  // Initialisation de l'URL de la photo quand l'utilisateur est chargé
  useEffect(() => {
    if (user?.photoURL) {
      setPhotoURL(user.photoURL);
    }
  }, [user]);

  // Redirection si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !user) {
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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de mettre à jour le profil : ${error.message || error}`,
      });
    },
  });

  const handleSubmit = useCallback((formData) => {
    updateProfileMutation.mutate(formData);
  }, [updateProfileMutation]);

  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La taille du fichier ne doit pas dépasser 5MB.",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner un fichier image valide.",
      });
      return;
    }

    setIsUploading(true);
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
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de télécharger la photo : ${error.message || error}`,
      });
    } finally {
      setIsUploading(false);
    }
  }, [user?.id, toast]);

  const handleEditToggle = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  const handleCancel = useCallback(() => {
    form.reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      username: user?.username || "",
      displayName: user?.displayName || "",
      phone: user?.phone || "",
    });
    setIsEditing(false);
  }, [form, user]);

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
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

            <Card className="w-full max-w-2xl mx-auto shadow-lg">
              <CardHeader className="bg-white border-b border-gray-100">
                <CardTitle className="text-xl sm:text-2xl text-gray-900">
                  Profil Utilisateur
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm">
                  Consultez et mettez à jour vos informations personnelles
                </CardDescription>
              </CardHeader>

              <CardContent className="bg-white p-4 sm:p-6">
                <div className="flex flex-col gap-6">
                  {/* Section Avatar et informations de base */}
                  <div className="flex flex-col items-center space-y-4 w-full">
                    <div className="relative">
                      <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-gray-200">
                        <AvatarImage
                          src={photoURL || undefined}
                          alt={user?.displayName || user?.username || "Utilisateur"}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-lg sm:text-xl font-semibold">
                          {user?.displayName?.charAt(0)?.toUpperCase() ||
                            user?.username?.charAt(0)?.toUpperCase() ||
                            user?.email?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                          <Icons.loader className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-2 w-full">
                      <p className="font-semibold text-gray-900 text-base sm:text-lg">
                        {user?.displayName || user?.username || "Utilisateur"}
                      </p>
                      <p className="text-sm text-gray-600 break-all">
                        {user?.email || "Email non défini"}
                      </p>
                      {user?.balance !== undefined && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border max-w-xs mx-auto">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Solde
                          </p>
                          <p className="font-bold text-lg text-green-600">
                            {user.balance.toFixed(2)} €
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Section upload photo - CORRECTION ICI */}
                    <div className="w-full max-w-sm">
                      {isEditing ? (
                        <div className="space-y-2">
                          <label
                            htmlFor="profile-photo"
                            className="block text-center text-sm font-medium text-gray-700"
                          >
                            Modifier la photo
                          </label>
                          <Input
                            id="profile-photo"
                            type="file"
                            accept="image/*"
                            className="text-sm w-full"
                            onChange={handlePhotoUpload}
                            disabled={isUploading}
                          />
                          {isUploading && (
                            <p className="text-xs text-center text-gray-500">
                              Téléchargement en cours...
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Section formulaire */}
                  <div className="w-full">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSubmit)}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 text-sm font-medium">
                                  Prénom
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditing}
                                    placeholder="Votre prénom"
                                    className={`transition-colors duration-200 ${
                                      !isEditing
                                        ? "bg-gray-50 text-gray-600 border-gray-200"
                                        : "bg-white border-gray-300 focus:border-blue-500"
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 text-sm font-medium">
                                  Nom
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    disabled={!isEditing}
                                    placeholder="Votre nom"
                                    className={`transition-colors duration-200 ${
                                      !isEditing
                                        ? "bg-gray-50 text-gray-600 border-gray-200"
                                        : "bg-white border-gray-300 focus:border-blue-500"
                                    }`}
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm font-medium">
                                Nom d'affichage
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Nom affiché publiquement"
                                  className={`transition-colors duration-200 ${
                                    !isEditing
                                      ? "bg-gray-50 text-gray-600 border-gray-200"
                                      : "bg-white border-gray-300 focus:border-blue-500"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm font-medium">
                                Nom d'utilisateur
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Votre nom d'utilisateur"
                                  className={`transition-colors duration-200 ${
                                    !isEditing
                                      ? "bg-gray-50 text-gray-600 border-gray-200"
                                      : "bg-white border-gray-300 focus:border-blue-500"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm font-medium">
                                Téléphone
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  disabled={!isEditing}
                                  placeholder="Votre numéro de téléphone"
                                  type="tel"
                                  className={`transition-colors duration-200 ${
                                    !isEditing
                                      ? "bg-gray-50 text-gray-600 border-gray-200"
                                      : "bg-white border-gray-300 focus:border-blue-500"
                                  }`}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          )}
                        />

                        {/* Boutons d'action */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                          {!isEditing ? (
                            <Button
                              type="button"
                              onClick={handleEditToggle}
                              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Icons.edit className="mr-2 h-4 w-4" />
                              Modifier
                            </Button>
                          ) : (
                            <>
                              <Button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                              >
                                {updateProfileMutation.isPending ? (
                                  <>
                                    <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                                    Enregistrement...
                                  </>
                                ) : (
                                  <>
                                    <Icons.check className="mr-2 h-4 w-4" />
                                    Enregistrer
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updateProfileMutation.isPending}
                                className="w-full sm:w-auto"
                              >
                                <Icons.x className="mr-2 h-4 w-4" />
                                Annuler
                              </Button>
                            </>
                          )}
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
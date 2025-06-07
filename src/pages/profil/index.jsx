import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Icons } from "@/assets/icons";
import { useLocation } from "wouter";

// Chargement dynamique des composants
const AvatarSection = lazy(() => import("./AvatarSection"));
const FormSection = lazy(() => import("./FormSection"));

export default function Profile() {
  const { user, updateUser, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState("");
  const [isFormReady, setIsFormReady] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      displayName: "",
      phone: "",
    },
  });

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

  // Mise à jour des valeurs par défaut du formulaire quand l'utilisateur change
  useEffect(() => {
    if (user && !isEditing) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        displayName: user.displayName || "",
        phone: user.phone || "",
      });
      setIsFormReady(true);
    }
  }, [user, form, isEditing]);

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
      console.error("Erreur lors de la mise à jour du profil :", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de mettre à jour le profil : ${error.message || error}`,
      });
    },
  });

  const handleSubmit = useCallback(
    (formData) => {
      updateProfileMutation.mutate(formData);
    },
    [updateProfileMutation]
  );

  const handlePhotoUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("Aucun fichier sélectionné.");
      return;
    }

    console.log("Fichier sélectionné :", file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);

    try {
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://backend-favisend.onrender.com/api/user/upload-photo", true);

        const token = localStorage.getItem("authToken");
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            console.log(`Progression de l'upload : ${progress}%`);
          }
        };

        xhr.onload = function () {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new Error(xhr.responseText));
          }
        };

        xhr.onerror = function () {
          reject(new Error("Erreur lors de l'upload."));
        };

        xhr.send(formData);
      });

      console.log("Réponse du backend :", response);

      if (!response.photoURL) {
        throw new Error("L'URL de la photo est manquante dans la réponse.");
      }

      setPhotoURL(response.photoURL);
      toast({
        title: "Photo téléchargée",
        description: "Votre photo de profil a été mise à jour.",
      });
    } catch (error) {
      console.error("Erreur lors du téléchargement de la photo :", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de télécharger la photo : ${error.message || error}`,
      });
    }
  }, [user, toast]);

  // Loader rapide pour les transitions
  const Loader = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Icons.loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement...</p>
      </div>
    </div>
  );

  // Affichage principal
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 hover:bg-gray-100"
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mon compte</h1>

          <Suspense fallback={<Loader />}>
            <AvatarSection
              photoURL={photoURL}
              user={user}
              isEditing={isEditing}
              handlePhotoUpload={handlePhotoUpload}
            />
          </Suspense>

          {isFormReady && (
            <Suspense fallback={<Loader />}>
              <FormSection
                form={form}
                isEditing={isEditing}
                handleSubmit={handleSubmit}
                setIsEditing={setIsEditing}
                updateProfileMutation={updateProfileMutation}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
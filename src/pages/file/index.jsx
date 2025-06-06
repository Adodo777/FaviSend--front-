"use client";

import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import FileDetail from "@/components/FileDetail";

export default function File() {
  const [, params] = useRoute("/file/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileId = params?.id;

  const [localComments, setLocalComments] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    data: fileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/files/detail/${fileId}`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/files/detail/${fileId}`);
      return response;
    },
    enabled: !!fileId,
    onSuccess: (data) => {
      setLocalComments(data.comments || []);
    },
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      comment: "",
      rating: 0,
    },
  });

  const rating = watch("rating");

  const commentMutation = useMutation({
    mutationFn: async (commentData) => {
      return await apiRequest("POST", `/api/files/comment/${user.id}`, commentData);
    },
    onSuccess: (newComment) => {
      setLocalComments((prev) => [newComment, ...prev]);
      toast({
        title: "Commentaire publié",
        description: "Votre commentaire a été publié avec succès.",
      });
      reset(); // Réinitialise le formulaire
    },
    onError: (error) => {
      console.error("Erreur lors de la publication du commentaire:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de publier le commentaire : ${error.message || "Erreur inconnue."}`,
      });
    },
  });

  const onSubmit = (data) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour laisser un commentaire.",
      });
      setLocation("/auth");
      return;
    }

    commentMutation.mutate({
      fileId: fileData.id,
      comment: data.comment.trim(),
      rating: data.rating,
    });
  };

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Ce fichier n'existe pas ou a été supprimé.",
      });
      setLocation("/explore");
    }
  }, [error, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin">
            <Icons.loader className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm text-gray-600">Chargement du fichier...</p>
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/explore")} className="mb-4">
            <Icons.arrowLeft className="mr-2 h-4 w-4" /> Retour à l'exploration
          </Button>

          <FileDetail file={fileData} />
        </div>

        {/* Comments section */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-semibold mb-6">Commentaires et avis</h2>

          {/* Comment form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <p className="text-sm font-medium mr-3">Votre note :</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none p-1"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setValue("rating", star)}
                        >
                          {(hoverRating || rating) >= star ? (
                            <Icons.starFill className="h-5 w-5 text-yellow-400" />
                          ) : (
                            <Icons.star className="h-5 w-5 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Partagez votre avis sur ce fichier..."
                    {...register("comment", { required: true })}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={commentMutation.isLoading}
                  className="w-full md:w-auto"
                >
                  {commentMutation.isLoading ? (
                    <>
                      <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                      Publication en cours...
                    </>
                  ) : (
                    <>
                      <Icons.send className="mr-2 h-4 w-4" />
                      Publier un commentaire
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments list */}
          {localComments.length > 0 ? (
            <div className="space-y-4">
              {localComments.map((comment) => (
                <Card
                  key={comment._id}
                  className="overflow-hidden animate-fade-in"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
                        <AvatarImage
                          src={
                            comment.userId?.photoURL ||
                            "https://media.istockphoto.com/id/2149922267/vector/user-icon.jpg?s=612x612&w=0&k=20&c=i6jYPfB1pWjK8pll6YRxAK9fgBmf65-w5wbKH9R1dyQ="
                          }
                          alt={comment.userId?.displayName || "Utilisateur"}
                        />
                        <AvatarFallback>
                          {comment.userId?.displayName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="font-medium text-sm truncate">
                            {comment.userId?.displayName || comment.userId?.username || "Utilisateur"}
                          </h4>
                          <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </span>
                        </div>
                        <div className="flex mt-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icons.starFill
                              key={i}
                              className={`h-4 w-4 ${
                                i < comment.rating ? "text-yellow-400" : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm break-words">{comment.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Icons.messageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Aucun commentaire</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Soyez le premier à laisser votre avis sur ce fichier!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

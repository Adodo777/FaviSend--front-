
import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import FileDetail from "@/components/FileDetail";

export default function File() {
  const [, params] = useRoute("/file/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [hasAccess, setHasAccess] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const fileId = params?.id;

  // Vérifier si l'URL contient des paramètres de succès de paiement
  const searchParams = new URLSearchParams(window.location.search);
  const paymentSuccess = searchParams.get('payment_success');
  const paymentSessionId = searchParams.get('session_id');

  const { data: fileData, isLoading, error } = useQuery({
    queryKey: [`/api/files/detail/${fileId}`],
    enabled: !!fileId,
  });

  // Mutation pour vérifier le paiement
  const checkPaymentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/purchase/verify`, {
      fileId,
      userId: user.id,
    }),
    onSuccess: (data) => {
      setHasAccess(data.hasPaid);
      setIsCheckingPayment(false);
    },
    onError: () => {
      console.error("Erreur lors de la vérification du paiement");
      setHasAccess(false);
      setIsCheckingPayment(false);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de vérifier le statut du paiement.",
      });
    }
  });

  // Mutation pour initialiser un paiement
  const initPaymentMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/purchase/init`, {
      fileId,
      userId: user.id,
    }),
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        // Rediriger vers l'URL de paiement
        window.location.href = data.checkoutUrl;
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'initialiser le paiement.",
      });
    }
  });

  // Vérifier le paiement au chargement du composant
  useEffect(() => {
    if (fileId && user) {
      setIsCheckingPayment(true);
      checkPaymentMutation.mutate();
    }
  }, [fileId, user, checkPaymentMutation]);

  // Vérifier le paiement si l'utilisateur revient après un paiement
  useEffect(() => {
    if (paymentSuccess === 'true' && paymentSessionId && fileId) {
      setIsCheckingPayment(true);
      checkPaymentMutation.mutate();
      
      // Nettoyer l'URL pour enlever les paramètres de paiement
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [paymentSuccess, paymentSessionId, fileId]);

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

  const downloadMutation = useMutation({
    mutationFn: (fileShareUrl) => 
      apiRequest("POST", `/api/files/download/${fileShareUrl}`),
    onSuccess: (response) => {
      response.json().then(data => {
        // Redirect to actual file URL for download
        window.open(data.downloadUrl, "_blank");
        queryClient.invalidateQueries({ queryKey: [`/api/files/detail/${fileId}`] });
        toast({
          title: "Téléchargement démarré",
          description: "Votre fichier commence à se télécharger.",
        });
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de télécharger le fichier: ${error}`,
      });
    }
  });

  const commentMutation = useMutation({
    mutationFn: (data) => 
      apiRequest("POST", `/api/files/comment`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/files/detail/${fileId}`] });
      setComment("");
      setRating(0);
      toast({
        title: "Commentaire publié",
        description: "Votre commentaire a été publié avec succès.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de publier le commentaire: ${error}`,
      });
    }
  });

  const handleDownload = () => {
    if (!fileData) return;
    
    if (user) {
      if (hasAccess) {
        // L'utilisateur a déjà payé, téléchargement direct
        downloadMutation.mutate(fileData.shareUrl);
      } else {
        // L'utilisateur doit payer
        initPaymentMutation.mutate();
      }
    } else {
      // Rediriger vers la page d'authentification
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour télécharger ce fichier."
      });
      setLocation("/auth");
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!fileData || !comment.trim() || rating === 0) return;
    
    if (user) {
      commentMutation.mutate({
        fileId: fileData.id,
        comment: comment.trim(),
        rating
      });
    } else {
      // Rediriger vers la page d'authentification
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour laisser un commentaire."
      });
      setLocation("/auth");
    }
  };

  if (isLoading) {
    return (
      <div className="pt-20 pb-16 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin">
          <Icons.loader className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  return (
    <div className="pt-20 pb-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/explore")}
            className="mb-4"
          >
            <Icons.arrowLeft className="mr-2 h-4 w-4" /> Retour à l'exploration
          </Button>
          
          <FileDetail 
            file={fileData} 
            onDownload={handleDownload} 
            isDownloading={downloadMutation.isPending || initPaymentMutation.isPending || isCheckingPayment} 
            isPaid={hasAccess}
          />
        </div>

        {/* Comments section */}
        <div className="mt-12">
          <h2 className="text-2xl font-heading font-semibold mb-6">Commentaires et avis</h2>
          
          {/* Comment form */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <p className="text-sm font-medium mr-3">Votre note :</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          {(hoverRating || rating) >= star ? (
                            <Icons.starFill className="h-6 w-6 text-yellow-400" />
                          ) : (
                            <Icons.star className="h-6 w-6 text-gray-300" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Partagez votre avis sur ce fichier..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!comment.trim() || rating === 0 || commentMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {commentMutation.isPending ? (
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
          {fileData.comments && fileData.comments.length > 0 ? (
            <div className="space-y-4">
              {fileData.comments.map((comment) => (
                <Card key={comment.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={comment.user.photoURL || undefined} alt={comment.user.displayName} />
                        <AvatarFallback>{comment.user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{comment.user.displayName}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                        <div className="flex mt-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icons.starFill 
                              key={i} 
                              className={`h-4 w-4 ${i < comment.rating ? 'text-yellow-400' : 'text-gray-200'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm">{comment.comment}</p>
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

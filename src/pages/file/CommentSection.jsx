import { useToast } from "@/hooks/use-toast";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import { apiRequest } from "@/lib/queryClient";

export default function CommentSection({ fileId, comments, setComments }) {
  const { toast } = useToast();

  // Fonction pour publier un commentaire
  const handleCommentSubmit = async (commentData) => {
    try {
      const newComment = await apiRequest("POST", `/api/files/comment`, {
        fileId,
        ...commentData,
      });
      setComments((prev) => [newComment, ...prev]);
      toast({
        title: "Commentaire publié",
        description: "Votre commentaire a été publié avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la publication du commentaire:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de publier le commentaire : ${error.message || "Erreur inconnue."}`,
      });
    }
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-heading font-semibold mb-6">Commentaires et avis</h2>
      <CommentForm onSubmit={handleCommentSubmit} />
      <CommentList comments={comments} />
    </div>
  );
}
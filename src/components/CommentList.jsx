import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export default function CommentList({ comments }) {
  if (comments.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Aucun commentaire pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <Card key={comment._id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage
                  src={comment.userId?.photoURL || "https://via.placeholder.com/40"}
                  alt={comment.userId?.displayName || "Utilisateur"}
                />
                <AvatarFallback>
                  {comment.userId?.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-medium">{comment.userId?.displayName || "Utilisateur"}</h4>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: fr })}
                </p>
                <p className="mt-2 text-gray-700">{comment.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
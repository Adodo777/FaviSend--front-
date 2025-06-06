import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function CommentForm({ onSubmit }) {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || rating === 0) return;

    await onSubmit({
      comment: comment.trim(),
      rating,
    });

    setComment("");
    setRating(0);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="mb-4">
        <p className="text-sm font-medium mb-2">Votre note :</p>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`h-6 w-6 ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <Textarea
        placeholder="Partagez votre avis sur ce fichier..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        className="resize-none mb-4"
        required
      />
      <Button type="submit" className="w-full">
        Publier un commentaire
      </Button>
    </form>
  );
}
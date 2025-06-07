import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

export default function AvatarSection({ photoURL, user, isEditing, handlePhotoUpload }) {
  return (
    <div className="flex flex-col items-center space-y-4 w-full">
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

      <div className="text-center space-y-2 w-full">
        <p className="font-semibold text-gray-900 text-base sm:text-lg">
          {user?.displayName || user?.username || "Utilisateur"}
        </p>
        <p className="text-sm text-gray-600 break-all">
          {user?.email || "Email non défini"}
        </p>
        {user?.balance !== undefined && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg border max-w-xs mx-auto">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Solde</p>
            <p className="font-bold text-lg text-green-600">
              {user.balance.toFixed(2)} €
            </p>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="w-full max-w-sm">
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
    </div>
  );
}
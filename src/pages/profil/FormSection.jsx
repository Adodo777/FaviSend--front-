import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/assets/icons";

export default function FormSection({ form, isEditing, handleSubmit, setIsEditing, updateProfileMutation }) {
  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 text-sm font-medium">Prénom</FormLabel>
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
                  <FormLabel className="text-gray-700 text-sm font-medium">Nom</FormLabel>
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
                <FormLabel className="text-gray-700 text-sm font-medium">Nom d'affichage</FormLabel>
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
                <FormLabel className="text-gray-700 text-sm font-medium">Nom d'utilisateur</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing}
                    placeholder="Nom d'utilisateur unique"
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
                <FormLabel className="text-gray-700 text-sm font-medium">Téléphone</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing}
                    placeholder="Votre numéro de téléphone"
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

          {isEditing && (
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
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
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5"
                onClick={() => {
                  form.reset(); // Réinitialiser le formulaire avec les valeurs par défaut
                  setIsEditing(false); // Désactiver le mode édition
                }}
              >
                <Icons.x className="mr-2 h-4 w-4" />
                Annuler
              </Button>
            </div>
          )}
        </form>
      </Form>

      {!isEditing && (
        <div className="w-full flex justify-center sm:justify-end mt-4">
          <Button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2"
          >
            <Icons.pencil className="mr-2 h-4 w-4" />
            Modifier le profil
          </Button>
        </div>
      )}
    </div>
  );
}
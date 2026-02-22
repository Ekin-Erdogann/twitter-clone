import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useFollow = () => {
    const queryClient = useQueryClient();
    const  { mutate: followUser, isPending } = useMutation({
        mutationFn: async (userId) => {
            try {
                const response = await fetch(`/api/users/follow/${userId}`, {
                    method: "POST",
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to follow user");
                }
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
        onSuccess: () => {
            toast.success("User followed successfully");
            Promise.all([
            queryClient.invalidateQueries({ queryKey: ["recommendedUsers"] }),
            queryClient.invalidateQueries({ queryKey: ["currentUser"] })
            ]);
            // Invalidate the posts query to refetch the updated list of posts
        },
        onError: (error) => {
            toast.error(error.message || "Failed to follow user");
        },
    });
    
    return { followUser, isPending };
}
export default useFollow;

CREATE TABLE IF NOT EXISTS public.review_rooms (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    room_id BIGINT NOT NULL,
    user_id UUID NOT NULL,
    rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_room
        FOREIGN KEY(room_id)
        REFERENCES public.rooms(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Add a policy to allow users to insert their own reviews
CREATE POLICY "Allow users to insert their own reviews" ON public.review_rooms
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add a policy to allow users to view all reviews
CREATE POLICY "Allow users to view all reviews" ON public.review_rooms
FOR SELECT USING (true);

-- Add a policy to allow users to update their own reviews
CREATE POLICY "Allow users to update their own reviews" ON public.review_rooms
FOR UPDATE USING (auth.uid() = user_id);

-- Add a policy to allow users to delete their own reviews
CREATE POLICY "Allow users to delete their own reviews" ON public.review_rooms
FOR DELETE USING (auth.uid() = user_id);

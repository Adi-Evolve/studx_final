CREATE TABLE wishlist (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
    note_id BIGINT REFERENCES notes(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure that only one of the item IDs is set for each wishlist entry
    CONSTRAINT single_item_type_check CHECK (
        (CASE WHEN product_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN note_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN room_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

-- Optional: Add indexes for better performance
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE UNIQUE INDEX idx_wishlist_user_product ON wishlist(user_id, product_id) WHERE product_id IS NOT NULL;
CREATE UNIQUE INDEX idx_wishlist_user_note ON wishlist(user_id, note_id) WHERE note_id IS NOT NULL;
CREATE UNIQUE INDEX idx_wishlist_user_room ON wishlist(user_id, room_id) WHERE room_id IS NOT NULL;

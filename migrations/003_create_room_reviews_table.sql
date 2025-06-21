CREATE TABLE room_reviews (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    room_id BIGINT NOT NULL,
    commenter_id UUID NOT NULL,
    review TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    FOREIGN KEY (commenter_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Optional: Add an index for faster lookups
CREATE INDEX idx_room_reviews_room_id ON room_reviews(room_id);

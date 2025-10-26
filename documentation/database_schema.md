# Database Schema and RLS Policies

## Overview
This document outlines the PostgreSQL database schema for the Responsive Media Dashboard, including tables, relationships, and Row Level Security (RLS) policies.

## Database Schema

### Tables

#### 1. `profiles` Table
Extended user profiles linked to Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**Fields:**
- `id`: Foreign key to Supabase Auth users table
- `email`: User email address
- `full_name`: User's full name
- `avatar_url`: Profile picture URL
- `role`: User role ('user' or 'admin')
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

#### 2. `categories` Table
Categories for organizing media content.

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('slider', 'gallery', 'video')),
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**Fields:**
- `id`: Unique identifier
- `name`: Category display name
- `slug`: URL-friendly slug
- `description`: Category description
- `type`: Category type (slider, gallery, or video)
- `is_active`: Whether category is active
- `sort_order`: Display order
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

#### 3. `media_items` Table
All media content (images, videos) with metadata.

```sql
CREATE TABLE media_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('slider', 'gallery', 'video')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  alt_text TEXT,
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  file_size BIGINT, -- in bytes
  dimensions JSONB, -- {width: number, height: number}
  metadata JSONB, -- additional metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

**Fields:**
- `id`: Unique identifier
- `title`: Media item title
- `description`: Media description
- `type`: Media type (slider, gallery, or video)
- `category_id`: Reference to category
- `file_url`: URL to the actual media file
- `thumbnail_url`: URL to thumbnail (for videos)
- `alt_text`: Alt text for images
- `video_url`: Embed URL for videos
- `video_duration`: Video duration in seconds
- `file_size`: File size in bytes
- `dimensions`: Image/video dimensions as JSON
- `metadata`: Additional metadata as JSON
- `is_active`: Whether media is active
- `sort_order`: Display order
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_media_items_type ON media_items(type);
CREATE INDEX idx_media_items_category_id ON media_items(category_id);
CREATE INDEX idx_media_items_is_active ON media_items(is_active);
CREATE INDEX idx_media_items_sort_order ON media_items(sort_order);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
```

## Row Level Security (RLS) Policies

### Enable RLS on All Tables

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
```

### Profiles Table Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Only admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can insert profiles
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Categories Table Policies

```sql
-- Public read access for active categories
CREATE POLICY "Public read active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Authenticated users can read all categories
CREATE POLICY "Authenticated read all categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage categories
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Media Items Table Policies

```sql
-- Public read access for active media items
CREATE POLICY "Public read active media" ON media_items
  FOR SELECT USING (is_active = true);

-- Authenticated users can read all media items
CREATE POLICY "Authenticated read all media" ON media_items
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can manage media items
CREATE POLICY "Admins manage media items" ON media_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Functions and Triggers

### Update Timestamp Function

```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';
```

### Triggers for Automatic Timestamp Updates

```sql
-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Profile Creation Trigger

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Storage Buckets and Policies

### Create Storage Buckets

```sql
-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
('slider-images', 'slider-images', true),
('gallery-images', 'gallery-images', true),
('video-thumbnails', 'video-thumbnails', true),
('avatars', 'avatars', true);
```

### Storage Policies

```sql
-- Public read access to slider images
CREATE POLICY "Public read slider images" ON storage.objects
  FOR SELECT USING (bucket_id = 'slider-images');

-- Admins can upload slider images
CREATE POLICY "Admins upload slider images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'slider-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public read access to gallery images
CREATE POLICY "Public read gallery images" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery-images');

-- Admins can upload gallery images
CREATE POLICY "Admins upload gallery images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'gallery-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Public read access to video thumbnails
CREATE POLICY "Public read video thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'video-thumbnails');

-- Admins can upload video thumbnails
CREATE POLICY "Admins upload video thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'video-thumbnails' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can read their own avatar
CREATE POLICY "Users read own avatar" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can upload their own avatar
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

## Sample Data

### Default Categories

```sql
-- Insert default categories
INSERT INTO categories (name, slug, description, type) VALUES
('Homepage Slider', 'homepage-slider', 'Images displayed on the homepage slider', 'slider'),
('Photo Gallery', 'photo-gallery', 'Images in the photo gallery', 'gallery'),
('Video Gallery', 'video-gallery', 'Videos in the video gallery', 'video');
```

## Security Considerations

### Data Access Patterns
1. **Public Content**: All active media items and categories are publicly readable
2. **Admin Operations**: Only authenticated admin users can modify content
3. **User Profiles**: Users can only view/edit their own profiles

### Performance Optimization
1. **Indexes**: Properly indexed for common query patterns
2. **RLS Efficiency**: Policies use efficient EXISTS clauses
3. **Storage**: Organized buckets for different media types

### Backup and Recovery
1. **Point-in-Time Recovery**: Enabled through Supabase
2. **Database Backups**: Daily automated backups
3. **Storage Backups**: File storage replicated across regions

## Migration Strategy

1. **Initial Setup**: Run schema creation in Supabase SQL editor
2. **Data Migration**: Import existing media metadata
3. **File Upload**: Upload existing media files to appropriate storage buckets
4. **Testing**: Verify RLS policies with different user roles
5. **Deployment**: Update environment variables and test all functionality
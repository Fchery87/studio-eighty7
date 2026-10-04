import React from 'react';
import type { Album } from '@/types';

interface AlbumsProps {
  albums: Album[];
}

const Albums: React.FC<AlbumsProps> = ({ albums }) => {
  if (albums.length === 0) return null;

  return (
    <section id="records" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-6">
        <h2 className="display text-4xl md:text-6xl mb-12">Records</h2>

        <ul className="flex gap-6 overflow-x-auto pb-4">
          {albums.map((album) => (
            <li key={album.id} className="w-56 shrink-0">
              <img
                src={album.cover}
                alt={`${album.title} cover art`}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <h3 className="mt-4 text-lg font-semibold">{album.title}</h3>
              <p className="data text-sm text-dust">
                {album.year}
                <br />
                {album.tracks} tracks
              </p>
              {(album.spotifyUrl || album.appleMusicUrl) && (
                <p className="mt-2 flex gap-4 text-sm">
                  {album.spotifyUrl && (
                    <a href={album.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">
                      Spotify
                    </a>
                  )}
                  {album.appleMusicUrl && (
                    <a href={album.appleMusicUrl} target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">
                      Apple Music
                    </a>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Albums;

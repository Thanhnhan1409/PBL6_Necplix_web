"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { env } from "@/env.mjs"
import { useModalStore } from "@/stores/modal"
import { useProfileStore } from "@/stores/profile"
import type { Genre, ShowWithGenreAndVideo } from "@/types"
import { useIsMutating } from "@tanstack/react-query"
import { toast } from "react-hot-toast"
import ReactPlayer from "react-player/lazy"
import { cn, getYear } from "@/lib/utils"
import DynamicTooltip from "@/components/dynamic-tooltip"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface ShowModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

const MovieDetail = ({ open, setOpen }: ShowModalProps) => {
  const router = useRouter()
  // stores
  const modalStore = useModalStore()
  const profileStore = useProfileStore()

  const [trailer, setTrailer] = React.useState("")
  const [genres, setGenres] = React.useState<Genre[]>([])
  const [isMuted, setIsMuted] = React.useState(false)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isAdded, setIsAdded] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState<boolean>(false)

  // get trailer and genres of show
  React.useEffect(() => {
    const getShow = async () => {
      if (!modalStore.show) return

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${modalStore.show?.id}?api_key=${
            env.NEXT_PUBLIC_TMDB_API_KEY
          }&language=en-US&append_to_response=videos`
        )
        const data = (await response.json()) as ShowWithGenreAndVideo
        if (data?.videos) {
          const trailerIndex = data.videos.results.findIndex(
            (item) => item.type === "Trailer"
          )
          setTrailer(data.videos?.results[trailerIndex]?.key ?? "")
        }
        if (data?.genres) {
          setGenres(data.genres)
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Something went wrong"
        )
      }
    }
    void getShow()
  }, [modalStore.show])

  React.useEffect(() => {
    if (modalStore.play) {
      setIsPlaying(true)
    } else {
      setIsPlaying(false)
    }
  }, [modalStore.play])

  React.useEffect(() => {
    if (isPlaying) {
      setIsMuted(false)
    } else {
      setIsMuted(true)
    }
  }, [isPlaying])
  // user query
  const mutationCount = useIsMutating()

  const onWatchMovie = () => {
    setIsLoading(true)
    router.push(`/movies/${modalStore.show?.id}`)
    setOpen(false);
  }

  return (
    <div>
      <div className="relative aspect-video">
          <div
            className={cn(
              "bg-black/10 bg-gradient-to-b from-neutral-900/10 to-neutral-900",
              "absolute inset-0 z-10 h-full w-full"
            )}
          />
          <ReactPlayer
            style={{ position: "absolute", top: 0, left: 0 }}
            url={`https://www.youtube.com/watch?v=${trailer}`}
            width="100%"
            height="100%"
            muted={isMuted}
            playing={isPlaying}
            controls={false}
            onStart={() => setIsPlaying(true)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
          <div className="absolute bottom-6 z-20 flex w-full items-center justify-between gap-2 px-10">
            <div className="flex items-center gap-2.5">
              <Button
                aria-label={`${isPlaying ? "Pause" : "Play"} show`}
                className="group h-auto rounded py-1.5"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Icons.pause
                      className="mr-1.5 h-6 w-6 fill-current"
                      aria-hidden="true"
                    />
                    Pause
                  </>
                ) : (
                  <>
                    <Icons.play
                      className="mr-1.5 h-6 w-6 fill-current"
                      aria-hidden="true"
                    />
                    Play
                  </>
                )}
              </Button>
              <DynamicTooltip
                text={isAdded ? "Remove from My List" : "Add to My List"}
              >
              </DynamicTooltip>
            </div>
            <Button
              aria-label={`${isMuted ? "Unmute" : "Mute"} video`}
              variant="ghost"
              className="h-auto rounded-full bg-neutral-800 p-1.5 opacity-50 ring-1 ring-slate-400 hover:bg-neutral-800 hover:opacity-100 hover:ring-white focus:ring-offset-0 dark:bg-neutral-800 dark:hover:bg-neutral-800"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <Icons.volumneMute className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Icons.volumne className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>
        <div className="grid gap-2.5 px-10 pb-10">
          <div className="flex justify-between items-center">
            <div className="text-lg font-medium leading-6 text-slate-50 sm:text-xl">
              {modalStore.show?.title ?? 'title show'}
            </div>
            <Button onClick={onWatchMovie}>
              Watch movie now
            </Button>
          </div>
          <div className="flex items-center space-x-2 text-sm sm:text-base">
            <p className="font-semibold text-green-400">
              {Math.round((Number(modalStore.show?.vote_average) / 10) * 100) ??
                "-"}
              % Match
            </p>
            {/* {modalStore.show?.release_date ? (
              <p>{getYear(modalStore.show?.release_date)}</p>
            ) : modalStore.show?.first_air_date ? (
              <p>{getYear(modalStore.show?.first_air_date)}</p>
            ) : null} */}
            {modalStore.show?.original_language && (
              <span className="grid h-4 w-7 place-items-center text-xs font-bold text-neutral-400 ring-1 ring-neutral-400">
                {modalStore.show.original_language.toUpperCase()}
              </span>
            )}
          </div>
          <div className="line-clamp-3 text-xs text-slate-50 dark:text-slate-50 sm:text-sm">
            {modalStore.show?.overview ?? "-"}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-slate-400">Genres:</span>
            {genres.map((genre) => genre.name).join(", ")}
          </div>
        </div>
        {
          isLoading && 
          <div className="fixed inset-0 z-[100] bg-white opacity-40">
            <Icons.spinner
              color="black"
              className="mr-2 h-4 w-4 animate-spin absolute top-1/2 right-1/2"
              aria-hidden="true"
            />
          </div>
        }
    </div>
  )
}

export default MovieDetail

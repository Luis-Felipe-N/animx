import { useQuery } from "react-query"
import { IEpisodesAnime } from "../../@types/Anime"
import { useAuth } from "../../hooks/useAuth"
import { api } from "../../service/api"
import { EpisodeCard } from "../EpisodeCard"

import style from "./style.module.scss"
import { Swiper, SwiperSlide } from "swiper/react"

export function KeepWatching() {
    const { user } = useAuth()

    const episodeIDs = user?.watchingEpisodes.filter(episode => {
        if (episode.assistedTime > 0) return episode
    }).map(epsiode => epsiode.id)

    const { isLoading: watchinEpisodesLoading, error: watchinEpisodesError, data: watchinEpisodesData, isFetching: watchinEpisodesFetching } = useQuery({
        queryKey: ['myListAnimesData'],
        queryFn: async (): Promise<IEpisodesAnime[]> =>{
            const { data } = await api.post('animes/episodes/', {
                episodeIDs: episodeIDs || []
            })
            
            return data.episodes
        },
    })

    console.log(watchinEpisodesData)

    if (!user && !watchinEpisodesData) return null

    return (
        <section className={style.keepWatching}>
            <h2>Continue assistido</h2>
            <Swiper
                slidesPerView={4}
                spaceBetween={10}
            >            
                {
                    watchinEpisodesData?.map(episode => (
                        <SwiperSlide key={episode.id}>
                            <EpisodeCard  episode={episode} />
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </section>
    )
}
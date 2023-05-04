import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useQuery } from "react-query"
import { IAnimes, IEpisodesAnime } from "../@types/Anime"
import { IUser } from "../@types/User"
import { Avatar } from "../components/Avatar"
import { Button } from "../components/Button"
import { CardAnime } from "../components/CardAnime"
import { Loading } from "../components/Loading"
import { ModalEditProfile } from "../components/ModalEditProfile"
import { Skeleton } from "../components/Skeleton"
import { useAuth } from "../hooks/useAuth"
import { api } from "../service/api"
import { getUserData } from "../service/firebase"

import style from "../styles/Profile.module.scss"

export default function Perfil() {
    const { user } = useAuth()

    const { isLoading: userDataLoading, error: userDataError, data: userDataData } = useQuery({
        queryKey: ['userDataData'],
        queryFn: async (): Promise<IUser | null> => {
            return getUserData(user?.uid || null)
        },
    })
    
    const myListAnimes = userDataData?.myListAnimes ? Object.entries(userDataData.myListAnimes).map(([,animeSlug]) => animeSlug) : []
    const watchedAnimes = userDataData?.watchedAnimes ? Object.entries(userDataData.watchedAnimes).map(([,episodeId]) => episodeId) : []

    function createRangeArrayByNumber(number: number) {
        return [...Array(number).keys()]
    }

    const { isLoading: myListAnimesLoading, error: myListAnimesError, data: myListAnimesData } = useQuery({
        queryKey: ['myListAnimesData'],
        queryFn: async (): Promise<IAnimes[]> =>{
            const { data } = await api.post('animes/slugs', {
                animesSlug: myListAnimes
            })
            
            return data.animes
        },
    })

    console.log(myListAnimesData)

    return (
        <main className={style.profile}>
            { userDataData ? (
                <>
                <Head>
                    <title>
                        Kyuden :: {userDataData.displayName}
                    </title>
                </Head>
                <section className={style.profile__banner} style={{backgroundImage: `linear-gradient(180deg, rgba(23,25,35,.8) 100%, rgba(23,25,35,9) 100%), url(${userDataData.banner})`}}>
                        <div className={style.profile__banner_container}>
                            <div>
                            <ModalEditProfile />
                            </div>

                            <div>
                                {userDataData?.avatar ? (
                                    <Avatar style={{borderRadius: "10px"}} hasBorder className={style.profile__banner_avatar} src={userDataData?.avatar} fallback={userDataData.displayName[0]} />
                                ) : (
                                    <Avatar className={style.profile__banner_avatar} fallback={userDataData.displayName[0]} />
                                )}
                                <div>
                                    <h1>{userDataData?.displayName}</h1>
                                    <small>{userDataData.email}</small>
                                    <ul>
                                        <li>Favoritos ({myListAnimes.length})</li>
                                        <li>Animes assistidos ({watchedAnimes.length})</li>
                                    </ul>
                                </div>
                            </div>                        
                        </div>
                </section>
                <section className={style.profile__animes}>
                    <div className={style.profile__countanimes}>
                        <h1>Animes</h1>
                        <ul>
                            <li>Favoritos ({myListAnimes.length})</li>
                            <li>Assistidos</li>
                        </ul>
                    </div>
                    <div className={style.profile__animes_container}>
                        { myListAnimesLoading 
                        ? (
                            createRangeArrayByNumber(myListAnimes.length).map((item: any) => (<Skeleton key={item} width={210} height={305} />))
                        ) : myListAnimesError 
                        ? (
                            
                            <div className={style.profile__animes_errorMessage}>
                                <span>Vixii!</span>
                                <strong>Alguma coisa deu errado em buscar seus animes favorito!</strong>
                                <strong>:(</strong>

                            </div>
                        ) :  myListAnimesData 
                        ? (
                            myListAnimesData.map(anime => (
                                <CardAnime key={anime.slug} anime={anime} />
                            ))
                        ): (
                            <p>Lista vazia</p>
                        )}                      
                    </div>
                </section>
                </>
            ) : (
                <p>Usuário nao encontrado</p>
            )}
        </main>
    )
}
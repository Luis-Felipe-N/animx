import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, updateCurrentUser, setPersistence, browserSessionPersistence, User } from "firebase/auth";
import { createContext, ReactNode, useEffect, useState } from "react";
import { auth } from "../libs/firebase";
import { createUser, getUserData } from "../service/firebase";
import { IUser } from "../@types/User";
interface IUserUpdate {
  displayName?: string | null
  photoURL?: string | null
  uid?: string
}

interface ICreateUser {
  email: string, 
  password: string, 
  name: string, 
  username: string
}

export interface IUserLoginCredentials {
  email: string,
  password: string
}

interface IAuthenticationContext {
  createAccount: ({email, password, name, username}: ICreateUser) => Promise<User | Error>;
  login: ({email, password}: IUserLoginCredentials) => Promise<void | Error>;
  logout:  () => void;
  user: IUser | null;
  loading: boolean;
}

interface IAuthenticationProviderProps {
  children: ReactNode
}

export const AuthContext = createContext({} as IAuthenticationContext)

export function AuthenticationProvider({ children }: IAuthenticationProviderProps) {
  const [user, setUser] = useState<IUser | null>(null)

  console.log(user)

  useEffect(() => {
    auth.onAuthStateChanged((userPersistence: any) => {
      console.log(userPersistence)
      if (userPersistence !== null) {
        console.log("antes getUser")
        getUserData(userPersistence.uid, setUser)
        console.log("apos getUser")
      }
    });
  }, [])

  async function createAccount({email, password, name, username}: ICreateUser): Promise<User | Error> {
    return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // ADD USER DATA IN REALTIME DATABASE
      createUser({
        id: user.uid,
        displayName: name,
        email: email,
        providerId: user.providerId,
      })

      updateProfile(user, {
        displayName: name
      })

      return user
    })
    .catch((error) => {
      return new Error(error)
    });
  }

  function logout() {
    signOut(auth).then(() => {
      setUser(null)
    }).catch((error) => {
      // An error happened.
    });
  }

  function login({email, password}: IUserLoginCredentials) {  
  
    return setPersistence(auth, browserSessionPersistence).then(() => {
      return signInWithEmailAndPassword(auth, email, password)
      .then((userCredential: any) => {
        const {uid, ...user} = userCredential.user.providerData[0];
        getUserData(userCredential.user.uid, setUser)

      })
      .catch((error: any) => {
        return new Error(error)
      });
    })
  }



  return (<AuthContext.Provider value={{ createAccount, login, logout, user, loading }}>
    {children}
</AuthContext.Provider>)
}
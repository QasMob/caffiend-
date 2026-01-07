import {useState, useEffect, useContext, createContext } from "react";
import {auth,db} from '../../firebase'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {collection, doc, getDoc, onSnapshot} from 'firebase/firestore'


const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}



    export function AuthProvider(props){


    
    const {children} = props
    const [globalUser, setGlobalUser] = useState(null)
    const [globalData, setGlobalData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)


     function signup(email, password){
      
        return createUserWithEmailAndPassword(auth, email, password)
        
    
         
    }

     function login(email, password){
        
        return signInWithEmailAndPassword(auth, email, password)
        
    }

    function resetPassword(email){
        return sendPasswordResetEmail(auth, email)
    }


    async function logout(){
        try {
            setGlobalUser(null)
            setGlobalData(null)
            await signOut(auth)
        }
        catch(err){
            console.error(err)
        }
    }



    const value = { globalUser, globalData, setGlobalData, isLoading, signup, login, logout}

    useEffect(() => {
        // onAuthStateChanged listens for when users sign in, sign out, register
        
        
        const unsubcribe = onAuthStateChanged(auth, async (user) => {

            setGlobalUser(user)

            // if theres no user, empty user state and return from listener
            if (!user) {return}

            // if there is user, check if user has data in the database, and if they do fetch said data
            // and update global state


            try {
                setIsLoading(true)

                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)

                let firebaseData = {}

                if (docSnap.exists()){
                    firebaseData = docSnap.data()
                }

                setGlobalData(firebaseData)
            }  catch(err){
                console.error(err)
            } finally {
                setIsLoading(false)
            }
            


              
        }) 

        return () => unsubcribe

    }, [])


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
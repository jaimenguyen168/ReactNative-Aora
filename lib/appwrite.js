import { ColorSchemeStore } from 'nativewind/dist/style-sheet/color-scheme';
import { Client, Account, ID, Avatars, Databases, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jaimenguyen.aora',
    projectId: '66f07d050039b73d8adf',
    databaseId: '66f07ebf000cdd6bfd85',
    userCollectionId: '66f07ee1001918192c3d',
    videoCollectionId: '66f07f0d0023c3a541cd',
    storageId: '66f08037000b7cb90349'
}

const {
    endpoint,
    platform,
    projectId,
    databaseId,
    userCollectionId,
    videoCollectionId,
    storageId
} = config;

// Init your React Native SDK
const client = new Client();
client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform) // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Register User
export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email, 
            password, 
            username
        )
        if (!newAccount) throw new Error;

        const avatarUrl = avatars.getInitials(username)
         
        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        )

        return newUser;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);
        if (!session) throw new Error

        return session;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export const getCurrentuser = async () => {
    try {
        const session = await account.get();
        if (!session) throw Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionId,
            [Query.equal('accountId', session.$id)]
        )

        if (!currentUser) throw Error;
        return currentUser.documents[0];
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

export const getVideos = async () => {
    try {
        const videos = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt')]
        )
        return videos.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const getLatestVideos = async () => {
    try {
        const videos = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(7)]
        )
        return videos.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export const searchVideos = async (query) => {
    try {
        const videos = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.contains('title', query)]
        )
        return videos.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const getUserVideos = async (userId) => {
    try {
        const videos = await databases.listDocuments(
            databaseId,
            videoCollectionId,
            [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
        )
        return videos.documents;
    } catch (error) {
        throw new Error(error)
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current')
        return session
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
}

// upload files
export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
        if (type === 'image') {
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
        } else if (type === 'video') {
            fileUrl = storage.getFileView(storageId, fileId)
        } else {
            throw new Error('Invalid file type')
        }

        if (!fileUrl) throw Error;
        return fileUrl

    } catch (error) {
        throw new Error(error);
    }
}

export const uploadFile = async (file, type) => {
    if (!file) return;

    // const { mimeType, ...rest } = file
    // const asset = { type: mimeType, ...rest }

    const asset = { 
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri
     }

    try {
        const uploadedFile = await storage.createFile(
            storageId,
            ID.unique(),
            asset
        )
        const fileUrl = await getFilePreview(uploadedFile.$id, type)
        return fileUrl
    } catch (error) {
        throw new Error(error);
    }
}

export const createVideo = async (form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video')
        ])
        
        const newPost = await databases.createDocument(
            databaseId,
            videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                prompt: form.prompt,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                creator: form.userId
            }
        )
        return newPost
    } catch (error) {
        throw new Error(error);
    } 
}

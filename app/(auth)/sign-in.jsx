import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from '../../constants'
import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { Link, router } from 'expo-router'
import { getCurrentuser, signIn } from '../../lib/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const SignIn = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext()

  const [form, setForm] = React.useState({
    email: '',
    password: ''
  })

  const [isSubmiting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields')
    }
    
    setIsSubmitting(true);

    try {
      await signIn(form.email, form.password)
      
      // set global state
      const result = await getCurrentuser()
      setUser(result)
      setIsLoggedIn(true) 
      
      // navigate to home
      router.replace('/home')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[80vh] px-4 my-6">
          <Image
            source={images.logo}
            resizeMethod='contain'
            className="w-[115px] h-[35px]"
          />

          <Text className="text-white text-2xl font-psemibold mt-10">
            Log in to Aora
          </Text>

          <FormField 
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField 
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton 
            title="Sign In"
            handlePress={submit}
            containerStyle="mt-7"
            isLoading={isSubmiting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-gray-100 font-pregular text-lg">
              Don't have an account?
            </Text>
            <Link href="/sign-up" className='text-lg font-psemibold text-secondary'>
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn
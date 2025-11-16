'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signUpSchema, signInSchema } from '@/lib/validations/auth'
import type { SignUpInput, SignInInput } from '@/lib/validations/auth'

export async function signUp(data: SignUpInput) {
  try {
    // Validate input
    const validated = signUpSchema.parse(data)

    const supabase = await createClient()

    // Sign up user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          full_name: validated.fullName,
          company_name: validated.companyName || null,
        },
      },
    })

    if (signUpError) {
      return { error: signUpError.message }
    }

    if (!authData.user) {
      return { error: 'Failed to create user' }
    }

    // Update profile with company name
    if (validated.companyName) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ company_name: validated.companyName })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('Failed to update profile:', updateError)
      }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Sign up error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function signIn(data: SignInInput) {
  try {
    // Validate input
    const validated = signInSchema.parse(data)

    const supabase = await createClient()

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (error) {
      return { error: error.message }
    }

    // Check if user is admin
    if (authData.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single()

      revalidatePath('/', 'layout')
      return { success: true, isAdmin: profile?.is_admin || false }
    }

    revalidatePath('/', 'layout')
    return { success: true, isAdmin: false }
  } catch (error) {
    console.error('Sign in error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { ...user, profile }
}

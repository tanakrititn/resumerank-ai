import { signUpSchema, signInSchema } from '../src/lib/validations/auth'

console.log('🧪 Testing Authentication Validation Schemas\n')
console.log('='.repeat(70))

// Test Sign Up Schema
console.log('\n📝 Testing Sign Up Schema:\n')

const signUpTests = [
  {
    name: 'Valid input',
    data: {
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'John Doe',
      companyName: 'Acme Inc',
    },
    shouldPass: true,
  },
  {
    name: 'Invalid email',
    data: {
      email: 'invalid-email',
      password: 'Password123',
      fullName: 'John Doe',
    },
    shouldPass: false,
  },
  {
    name: 'Password too short',
    data: {
      email: 'test@example.com',
      password: 'Pass1',
      fullName: 'John Doe',
    },
    shouldPass: false,
  },
  {
    name: 'Password missing uppercase',
    data: {
      email: 'test@example.com',
      password: 'password123',
      fullName: 'John Doe',
    },
    shouldPass: false,
  },
  {
    name: 'Password missing lowercase',
    data: {
      email: 'test@example.com',
      password: 'PASSWORD123',
      fullName: 'John Doe',
    },
    shouldPass: false,
  },
  {
    name: 'Password missing number',
    data: {
      email: 'test@example.com',
      password: 'PasswordABC',
      fullName: 'John Doe',
    },
    shouldPass: false,
  },
  {
    name: 'Full name too short',
    data: {
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'A',
    },
    shouldPass: false,
  },
  {
    name: 'Without optional company name',
    data: {
      email: 'test@example.com',
      password: 'Password123',
      fullName: 'John Doe',
    },
    shouldPass: true,
  },
]

let passCount = 0
let failCount = 0

for (const test of signUpTests) {
  try {
    signUpSchema.parse(test.data)
    if (test.shouldPass) {
      console.log(`✅ ${test.name}: PASSED`)
      passCount++
    } else {
      console.log(`❌ ${test.name}: FAILED (should have thrown error)`)
      failCount++
    }
  } catch (error) {
    if (!test.shouldPass) {
      console.log(`✅ ${test.name}: PASSED (correctly rejected)`)
      if (error instanceof Error) {
        const zodError = JSON.parse(error.message)
        console.log(`   └─ Error: ${zodError[0].message}`)
      }
      passCount++
    } else {
      console.log(`❌ ${test.name}: FAILED (should have passed)`)
      if (error instanceof Error) {
        console.log(`   └─ Error: ${error.message}`)
      }
      failCount++
    }
  }
}

// Test Sign In Schema
console.log('\n' + '='.repeat(70))
console.log('\n📝 Testing Sign In Schema:\n')

const signInTests = [
  {
    name: 'Valid input',
    data: {
      email: 'test@example.com',
      password: 'any-password',
    },
    shouldPass: true,
  },
  {
    name: 'Invalid email',
    data: {
      email: 'not-an-email',
      password: 'password',
    },
    shouldPass: false,
  },
  {
    name: 'Empty password',
    data: {
      email: 'test@example.com',
      password: '',
    },
    shouldPass: false,
  },
]

for (const test of signInTests) {
  try {
    signInSchema.parse(test.data)
    if (test.shouldPass) {
      console.log(`✅ ${test.name}: PASSED`)
      passCount++
    } else {
      console.log(`❌ ${test.name}: FAILED (should have thrown error)`)
      failCount++
    }
  } catch (error) {
    if (!test.shouldPass) {
      console.log(`✅ ${test.name}: PASSED (correctly rejected)`)
      if (error instanceof Error) {
        const zodError = JSON.parse(error.message)
        console.log(`   └─ Error: ${zodError[0].message}`)
      }
      passCount++
    } else {
      console.log(`❌ ${test.name}: FAILED (should have passed)`)
      if (error instanceof Error) {
        console.log(`   └─ Error: ${error.message}`)
      }
      failCount++
    }
  }
}

// Summary
console.log('\n' + '='.repeat(70))
console.log('\n📊 Test Summary:\n')
console.log(`✅ Passed: ${passCount}`)
console.log(`❌ Failed: ${failCount}`)
console.log(`📈 Total: ${passCount + failCount}`)
console.log('\n' + '='.repeat(70))

if (failCount === 0) {
  console.log('\n🎉 All validation tests passed!\n')
  process.exit(0)
} else {
  console.log('\n⚠️  Some tests failed. Please review the validation schemas.\n')
  process.exit(1)
}

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function resetPassword(email, newPassword) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      return
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(newPassword, salt)

    // Update user
    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    })

    console.log(`✅ Password reset successful for ${email}`)
    console.log(`   New password: ${newPassword}`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get email and password from command line
const email = process.argv[2]
const password = process.argv[3]

if (!email || !password) {
  console.log('Usage: node reset-password.js <email> <new-password>')
  console.log('\nAvailable users:')
  console.log('  - cqi24fvyv@mozmail.com')
  console.log('  - mordeng10@gmail.com')
  process.exit(1)
}

resetPassword(email, password)

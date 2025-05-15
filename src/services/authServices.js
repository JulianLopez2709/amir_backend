import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

export const CreateUser = async (email, password, username, name , phone) => {

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: { email, password: hashedPassword, username, name, phone },
    });

    console.log(user);

    return user;
}
import bcrypt from 'bcrypt';

async function generateHash() {
    const password = 'Admin123*';
    const saltRounds = 10;
    
    try {
        // Usar el mismo salt para generar un hash idéntico
        const salt = '$2b$10$3euPcmQFCiblsZeEu5s7p.';
        const hash = await bcrypt.hash(password, salt);
        console.log('Hash generado para Admin123*:');
        console.log(hash);
        
        // Verificar que el hash funciona
        const isMatch = await bcrypt.compare(password, hash);
        console.log('¿El hash es válido?', isMatch);
    } catch (error) {
        console.error('Error al generar el hash:', error);
    }
}

generateHash();
const bcrypt = require('bcryptjs');

exports.handler = async (event) => {
    const { username, password } = JSON.parse(event.body);
    const adminUser = 'RUUUDY';
    const adminPassHash = '$2y$10$P7HTZ40EZeN6ngIHTJaXPurWno6HvIYBtxF0GvYkg3UNXyZ6HeUnW';

    if (username === adminUser && bcrypt.compareSync(password, adminPassHash)) {
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful' })
        };
    } else {
        return {
            statusCode: 401,
            body: JSON.stringify({ message: 'Login failed' })
        };
    }
};
import { Server, Socket } from 'socket.io';
import { Express, Request, Response } from 'express';

const connected_users: string[] = []
const writing_users: string[] = [];

export function ChatController(app: Express, io: Server, port: Number) {

    app.get('/', (req: Request, res: Response) => {
        res.sendFile(__dirname + '/index.html');
    });
    
    io.on('connection', (socket) => {
        socket.on('chat message', (msg: string) => {
            io.emit('chat message', msg);
        });
    
        socket.on('new user', (username: string) => {
            connected_users.push(username);
            io.emit('connected_users', connected_users);
        })
    
        socket.on('user is writing', (username: string) => {
            writing_users.push(username);
            io.emit('writing users', writing_users);
        });
    
        socket.on('user stops writing', (username: string) => {
            const index: number = writing_users.indexOf(username);
            if (index > -1) {
                writing_users.splice(index, 1);
                console.log(username + " stops writing");
                console.log(writing_users);
                io.emit('writing users', writing_users);
            }
        });
    });   
};
# eSports Tourneys Server

## Description
Backend API for the eSports Tournaments platform. Built with NestJS, this server handles user authentication, tournament management, invitations, real-time match updates via Socket.IO, and data persistence with TypeORM and PostgreSQL.

## Features
- **User Management**: Registration, login (JWT), profile updates.
- **Tournament CRUD**: Create, read, update, delete tournaments.
- **Invitations**: Invite friends to tournaments via email or direct link.
- **Bracket Management**: Manage tournament brackets and match assignments.
- **Real-time Updates**: Socket.IO for live match results and bracket progress.
- **Email Notifications**: SendGrid integration for invitation and update emails.
- **Swagger API Docs**: Automatic API documentation at `/api`.

## Tech Stack
- **Language & Framework**: TypeScript, NestJS
- **Database**: PostgreSQL via TypeORM
- **Realtime**: Socket.IO
- **Authentication**: Passport (JWT)
- **Email**: @sendgrid/mail
- **File Storage**: Cloudinary (for any media uploads)
- **Testing**: Jest, Supertest
- **API Docs**: @nestjs/swagger

## Prerequisites
- Node.js >= 18
- npm or yarn
- PostgreSQL database
- Redis (optional, if implementing job queues or caching)

## Environment Variables
Create a `.env` file in the project root:
```dotenv
  STAGE=
  DB_URL=
  JWT_SECRET=
  SENDGRID_KEY=
  DEV_ENV=
  PROD_ENV=
```

## Installation

1. **Clone the repo**  
   ```bash
   git clone <repository-url>
   cd e-sports-tourneys-server
   ```

2. **Install dependencies**  
   ```bash
   npm install
   # or
   yarn install
   ```

## Running the Server

- **Development**  
  ```bash
  npm run dev
  ```
- **Production**  
  ```bash
  npm run build
  npm start
  ```

## Scripts

| Command            | Description                             |
| ------------------ | --------------------------------------- |
| `npm run dev`      | Run in watch mode with debug            |
| `npm run build`    | Compile the application                 |
| `npm run start:prod` | Start the production build            |
| `npm run lint`     | Lint & fix code                         |
| `npm test`         | Run unit tests                          |
| `npm run test:e2e` | Run end-to-end tests                    |


## API Documentation
Swagger UI available at `http://localhost:3000/api`

## Contributing
1. Fork the repository  
2. Create a branch (`git checkout -b feature/your-feature`)  
3. Commit your changes (`git commit -m 'feat: add your feature'`)  
4. Push to branch (`git push origin feature/your-feature`)  
5. Open a Pull Request

## License
This project is licensed under the MIT License.  

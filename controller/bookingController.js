const { request } = require('express')
const ticketModel = require('../models/ticketBooking')
const userModel = require('../models/userModel')

const jwt = require('jsonwebtoken')
const JWT_TOKEN = 'vhvgxdayghujikjhgf'

const movieBooking = async (request, response) => {
    try {

        const requestData = request.body.data
        const detail = request.body.bookingDetail
        console.log(requestData, detail)
        //authentication Verification
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const loggedInUser = jwt.verify(token, JWT_TOKEN)
        const loggedInUserEmail = loggedInUser.email
        console.log(loggedInUserEmail)

        //cheking emails
        const authenticatedUser = await userModel.find({ email: loggedInUserEmail })
        if (authenticatedUser.length === 1) {
            const createdTickets = [];
            for (const data of requestData) {
                const bookingData = {
                    firstName: detail.firstName,
                    lastName: detail.lastName,
                    location: detail.location,
                    slot: detail.slot,
                    gender: detail.gender,
                    consideration: detail.consideration,
                    date: detail.date,
                    seatName: data.seatName,
                    seatType: data.seatType,
                    movieName: data.movieName,
                    email: loggedInUserEmail
                };
                const createdTicket = await ticketModel.create(bookingData);
                createdTickets.push(createdTicket);
            }

            return response.status(201).json({ message: 'Tickets Booked Successfully!', tickets: createdTickets });

        }
    }
    catch (error) {
        response.status(500).json({ message: error.message })
    }
}

const getBookings = async (request, response) => {
    try {
        // console.log("yes")

        //authentication verification
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const loggedInUser = jwt.verify(token, JWT_TOKEN)
        const loggedInUserEmail = loggedInUser.email
        console.log(loggedInUserEmail)
        const authenticatedUser = await userModel.find({ email: loggedInUserEmail })

        //retrieve bookings
        if (authenticatedUser) {
            const currentDate = new Date().toISOString();
            const bookings = await ticketModel.find({
                email: loggedInUserEmail,
                date: { $gt: currentDate }
            });
            console.log(bookings)
            return response.status(200).json(bookings)
        }
    }
    catch (error) {
        response.status(500).json({ message: error.message })
    }
}

const getBookedseats = async (request, response) => {
    try {
        const location = request.params.location
        const { movieName, slot } = request.query
        // console.log(location,movieName,slot)

        const seatsBooked = await ticketModel.find({ location: location, movieName: movieName, slot: slot }, { seatName: 1, gender: 1, consideration: 1 });
        console.log(seatsBooked)
        if (seatsBooked) {
            return response.status(200).json(seatsBooked);
        }
        else {
            return response.status(100).json({ message: "continue" })
        }
    } catch (error) {
        response.status(500).json({ message: error.message });
    }
}

module.exports = { movieBooking, getBookings, getBookedseats }

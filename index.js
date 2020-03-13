//Sample data for Assignment 3

//The following is an example of an array of two events. 
var events = [
    { id: 0, name: "The Whistlers", description: "Romania, 2019, 97 minutes", location: "Bio Paradís, Salur 1", capacity: 40, remaining: 31, 
    startDate: new Date(Date.UTC(2020, 02, 03, 22, 0)), endDate: new Date(Date.UTC(2020, 02, 03, 23, 45)), bookings: [0,1,2] },

    { id: 1, name: "HarpFusion: Bach to the Future", description: "Harp ensemble", location: "Harpa, Hörpuhorn", capacity: 100, remaining: 100,
    startDate: new Date(Date.UTC(2020, 02, 12, 15, 0)), endDate: new Date(Date.UTC(2020, 02, 12, 16, 0)), bookings: [] }
];

//The following is an example of an array of three bookings.
var bookings = [
    { id: 0, firstName: "John", lastName: "Doe", tel: "+3541234567", email: "", spots: 3, eventID: 0},
    { id: 1, firstName: "Jane", lastName: "Doe", tel: "", email: "jane@doe.doe", spots: 1, eventID: 0},
    { id: 2, firstName: "Meðaljón", lastName: "Jónsson", tel: "+3541111111", email: "mj@test.is", spots: 5, eventID: 0}
];

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

//all routes for events
function eventRoutes(){
    //GET all events
    app.get('/events', (req, res) =>{
        response = getEvents();
        if(response == null)
            res.status(404).send("Error no such thing as events here");
        else
            res.status(200).send(response)
    });
    //GET individual event
    app.get('/events/:event_id', (req, res) =>{
        response = getEvents(req.params.event_id);
        if(response == null)
            res.status(404).send("Error no such thing as events here");
        else
            res.status(200).send(response)
    });
    //POST a new event
    app.post('/events', (req, res) =>{
        let new_event = createEvent(req.query);
        console.log(req);
        res.status(201).send(new_event);
    });
    //PUT an event
    app.put('/events/:event_id', (req, res) =>{
        let event_id = req.params.event_id;
        let args = req.query;
        let result = editEvent(event_id, args);
        if(result.id)
            res.status(200).send(result);
        else
            res.status(400).send(result);
        
    });
    //DELETE an event
    app.delete('/events/:event_id', (req, res) =>{
        let result = deleteEvents(req.params);
        
        if (result == 400) {
            res.status(400).send("Cannot delete event that has bookings");
        } else {
            res.status(200).send(result);
        }
    });
    //DELETE all events
    app.delete('/events', (req, res) => {
        let result = deleteEvents(req.params);
        
        res.status(200).send(result);
    });
}
//all routes for bookings
function bookingRoutes(){
    // Endpoints for Bookings
    // GET all bookings for an event
    app.get('/events/:event_id/bookings', (req, res) => {
        let tmp_response = getBookings(req.params);

        if (tmp_response == 404)
            res.status(404).send('404: Not Found');
        else if(tmp_response == 400)
            res.status(400).send('Error');
        else
            res.status(200).send(tmp_response);
    });
    // GET an individual booking
    app.get('/events/:event_id/bookings/:booking_id', (req, res) => {
        let tmp_response = getBookings(req.params);

        if (tmp_response == 404)
            res.status(404).send('404: Not Found');
        else if(tmp_response == 400)
            res.status(400).send('Error');
        else
            res.status(200).send(tmp_response);
    });
    // POST a new booking
    app.post('/events/:event_id/bookings', (req, res) => {
        let result = createBooking(req.query, req.params.event_id);
        
        if (result[0] == 201) {
            res.status(201).send(result[1]);
        } else {
            res.status(400).send("Unknown error");
        }
    });
    // DELETE a booking
    app.delete('/events/:event_id/bookings/:booking_id', (req, res) => {
        let result = deleteBookings(req.params);

        if (result[0] == 200) {
            res.status(200).send(result[1]);
        } else if(result[0] == 404) {
            res.status(result[0]).send(result[1]);
        } else {
            res.status(400).send("Unknown error");
        }
    });
    // DELETE all bookings for an event
    app.delete('/events/:event_id/bookings', (req, res) => {
        let result = deleteBookings(req.params);
        
        if (result[0] == 200) {
            res.status(200).send(result[1]);
        } else if(result[0] == 404) {
            res.status(result[0]).send(result[1]);
        }
        else {
            res.status(400).send("Unknown error");
        }
    });
}

//get event or all events if event_id == null or undefined you get all events
function getEvents(event_id){
    let returnPar;
    if(event_id == null)
        returnPar = events;
    else{
        id = parseInt(event_id);
        events.forEach(event => {
            if(event.id == id){
                returnPar = event;
            }
        });
    }
    return returnPar;
}

//Create events, args needs to be an object with at least a name, capacity, startDate and endDate optional args are :  description and location
function createEvent(args) {
    //verify user input
    if(!args.name || !args.capacity || !args.startDate || !args.endDate)
        return "Missing requiered input parameters"
    else if(typeof(args.name) == "string" || typeof(args.capacity) == "number" || typeof(args.startDate) == "number" || typeof(args.endDate) == "number")
        return "Input parameters are not of the correct datatypes";
    
    //auto generate ID
    let id = events[events.length-1].id + 1;
    let event = {
        id: id,
        name: args.name,
        description: (args.description == null) ? "" : args.description,
        location: (args.location == null) ? "" : args.location,
        capacity: args.capacity,
        remaining: args.capacity,
        startDate: new Date(parseInt(args.startDate)),
        endDate: new Date(parseInt(args.endDate)),
        bookings: []
    }
    events.push(event);
    return event;
}

function editEvent(id, args) {
    //check if event has bookings
    let index;
    id = parseInt(id);
    events.forEach(event => {
        if(event.id == id){
            index = events.indexOf(event);
        }
    });

    if(events[index].bookings.length != 0)
        return "You cannot edit the details of an event that has ongoing bookings";

    //verify user input
    if(args.name)
        if(typeof(args.name) != "string")
            return "Event name is not of the correct format";
        else
            events[index].name = args.name;
    if(args.capacity)
        if(parseInt(args.capacity))
            return "Event Capacity is not of the correct format";
        else
            events[index].capacity = args.capacity;
    if(args.startDate)
        if(parseInt(args.startDate))
            return "start date is not of the correct format";
        else
            events[index].startDate = args.startDate;
    if(args.endDate)
        if(parseInt(args.endDate))
            return "end date is not of the correct format";
        else
            events[index].endDate = args.endDate;
    if(args.description)
        if(typeof(args.description) != "string")
            return "event description is not of the correct format";
        else
            events[index].description = args.description;
    if(args.location)
        if(typeof(args.location) != "string")
            return "event location is not of the correct format";
        else
            events[index].location = args.location;
    
    return events[index];
}

function deleteEvents(args) {
    if (args.event_id == null) {
        // Delete all events
        let old_events = events;
        
        events = [];
        bookings = [];

        return old_events;
    } else {
        let tmp_event;

        for (let index = 0; index < events.length; index++) {
            const event = events[index];
            if (event.id == args.event_id) {
                tmp_event = event;
                break;
            }
        }

        if (tmp_event.bookings.length != 0) {
            // Cannot delete this event
            return 400;
        }

        events.splice(events.indexOf(tmp_event, 1));

        return tmp_event;
    }
}

function getBookings(args) {
    let tmp_event = null;
    let tmp_bookings = [];

    if(args.event_id == null) // Error
        return 400;
    else {
        // Loop through the events to find the right one
        events.forEach(event => {
            if (event.id == args.event_id) // Found the event
                tmp_event = event;
        });
        
        if (args.booking_id != null) {
            // Get 1 booking
            for (let i = 0; i < bookings.length; i++) {
                const booking = bookings[i];
                if (booking.eventID == args.event_id && booking.id == args.booking_id) {
                    tmp_bookings.push(booking);
                    break;
                }
            }
            
            if (tmp_bookings.length == 0)
                return 404;
            
            return tmp_bookings;
        } else {
            // Get all bookings for a specific event
            if (tmp_event == null) // Event not found
                return 404;
            else {
                // Get all the bookings that belong to the event
                tmp_event.bookings.forEach(element => {
                    bookings.forEach(booking => {
                        if (element == booking.id)
                            tmp_bookings.push(booking);
                    });
                });
    
                return tmp_bookings;
            }
        }
    }
}

//Create a booking for a event
function createBooking(args, event_id) {
    if(!args.firstName)
        return [400, "Missing First Name"]
    if(!args.lastName)
        return [400, "Missing Last Name"]
    if(!args.tel && !args.email)
        return [400, "Missing Contact Information"]
    if(!args.spots)
        return [400, "Missing number of spots"]
    
    let new_id = bookings[bookings.length-1].id + 1;
    let booking = { 
        id: new_id, 
        firstName: args.firstName,
        lastName: args.lastName, 
        tel: args.tel, 
        email: args.email, 
        spots: Number(args.spots),
        eventID: Number(event_id)
    };
    
    for (let index = 0; index < events.length; index++) {
        var event = events[index];
        if(event.id == event_id) {
            if(event.remaining - booking.spots < 0){
                return [400, "Not enough available spots"];
            }
            else {
                event.remaining = event.remaining - booking.spots;
                event.bookings.push(booking.id);
            }
        }
    }

    bookings.push(booking)
    return [201, booking]
}

//DeleteBooking or all bookings for an event
function deleteBookings(args) {
    if (args.booking_id == null) {
        //delete all bookings
        var old_event_bookings = [];
        var new_bookings = [];
        var deleted_bookings = [];
        events.forEach(event => {
            if(args.event_id == event.id) {
                old_event_bookings = event.bookings;
                event.bookings = [];
                event.remaining = event.capacity;
            }
        });
        bookings.forEach(booking => {
            if(!(booking.id in old_event_bookings)) {
                new_bookings.push(booking);
            }
            else{
                deleted_bookings.push(booking);
            }
        });
        
        if(deleted_bookings.length == 0){
            return [404, 'Found nothing to delete']
        }
        
        bookings = new_bookings;
        return [200, deleted_bookings]
    }
    else {
        var spots = 0;
        var deleted_booking;
        var new_booking;
        var new_bookings = [];
        var new_event_bookings = [];
       
        bookings.forEach(booking => {
            if(booking.id == args.booking_id) {
                spots += booking.spots;
                deleted_booking = booking;
            }
            else {
                new_bookings.push(booking);
            }
        });

        if(!deleted_booking) {
            return [404, 'Found nothing to delete']
        }

        bookings = new_bookings;

        events.forEach(event => { 
            if(event.id == args.event_id) {
                event.remaining += spots
                event.bookings.forEach(booking => {
                    if(booking != deleted_booking.id) {
                        new_event_bookings.push(booking);
                    }
                });
                event.bookings = new_event_bookings;
            }

        });
        
        return [200, deleted_booking]
    }
}

//create routes for events
eventRoutes();

//create routes for booking
bookingRoutes();

//start listening for requests on port 3000
//TODO: move path to /api/v1/ or something like that check the pdf for confirmation
app.listen(port, () => {
    console.log('Express app listening on port ' + port);
});
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

const bikes = [
  {
    id: "1",
    name: "bike1",
    price: 8000000,
  },
  {
    id: "2",
    name: "super bike",
    price: 18000000,
  },
];

const bookings = [
  {
    id: "1",
    date: "2023-02-15",
    time: 2,
    bike: bikes[0],
    userName: "병도",
    phone: "01012345678",
  },
  {
    id: "2",
    date: "2023-03-17",
    time: 7,
    bike: bikes[1],
    userName: "병도2",
    phone: "01087654321",
  },
];

const makeBookingCurrentTimes = (bikeId: string, selectDate: string) => {
  const currentBookings = bookings.filter(
    ({ bike, date }) => bike.id === bikeId && selectDate === date
  );

  const times = currentBookings.map(({ time }) => time);

  return times;
};

const typeDefs = `#graphql
  type Bike {
    id:ID!
    name: String!
    price: Int!
    description:String
  
  }

  type Booking {
    id: ID!
    date: String!
    time:Int!
    bike:Bike!
    userName:String!
    phone:String!
  } 

  type BookingTime {
    time:Int!
    available:Boolean!
  }

  type Result{
    code:Int!
    success:Boolean!
    message:String
  }

  type Query {
    bikes: [Bike]
    bookings:[Booking]
    bookingTimes(bikeId:String!,date:String!):[BookingTime]
  }

  type Mutation{
    book( 
    date: String!,
    time:Int!,
    bikeId:String!,
    userName:String!,
    phone:String!):Result,
  }
`;

const resolvers = {
  Query: {
    bikes: () => bikes,
    bookings: () => bookings,
    bookingTimes: (parent, args) => {
      let bookingTime: { time: number; available: boolean }[] = [];

      for (let i = 0; i < 24; i++) {
        bookingTime.push({
          time: i,
          available: true,
        });
      }

      const times = makeBookingCurrentTimes(args.bikeId, args.date);

      return bookingTime.map((ele) =>
        times.includes(ele.time) ? { ...ele, available: false } : ele
      );
    },
  },
  Mutation: {
    book: (parent, args) => {
      const times = makeBookingCurrentTimes(args.bikeId, args.date);

      if (times.includes(args.time)) {
        return {
          code: 400,
          success: false,
          message: "This time has already been reserved.",
        };
      }

      const bike = bikes.find(({ id }) => id === args.bikeId);

      const newBooking = {
        id: args.bikeId + args.date + args.time,
        bike,
        ...args,
      };

      bookings.push(newBooking);

      return {
        code: 200,
        success: true,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4003 },
});

console.log(`🚀  Server ready at: ${url}`);

// query ExampleQuery {
//   bookingTimes(bikeId: "1",date: "2023-02-16") {
//    time
//    available
//   }

//   bookings {
//     id
//     date
//     time
//     userName
//   }
// }

// mutation Mutation{
//  book(date: "2023-02-15", time: 5, bikeId: "1", userName: "정민", phone: "01093240222") {
//  code
//  success
//  message
//  }
// }

import { Meteor } from 'meteor/meteor'
import Restaurants from './restaurants'
import restaurantData from '../../data/restaurant-data'

const restaurantsRaw = Restaurants.rawCollection()

const methods = {
  'restaurants/importSimple' () {
    Restaurants.remove({})

    const timer = Date.now()

    restaurantData.forEach((restaurant) => {
      Restaurants.insert(restaurant)
    })

    console.log(`Completed in ${Date.now() - timer}ms`)
  },

  'restaurants/importBulk' () {
    Restaurants.remove({})

    const timer = Date.now()
    const bulkRestaurantOp = restaurantsRaw.initializeUnorderedBulkOp()
    bulkRestaurantOp.executeAsync = Meteor.wrapAsync(bulkRestaurantOp.execute)

    restaurantData.forEach((restaurant) => {
      bulkRestaurantOp.insert(Object.assign({}, restaurant))
    })
    bulkRestaurantOp.executeAsync()

    console.log(`Completed in ${Date.now() - timer}ms`)
  },

  'restaurants/getTopNaive' () {
    const timer = Date.now()

    const topRestaurants = Restaurants.find({})
      .map((r) => {
        const numGrades = r.grades.length
        return {
          _id: r.restaurant_id,
          name: r.name,
          numGrades,
          averageScore: r.grades.reduce((sum, g) => sum + g.score, 0) / numGrades
        }
      })
      .filter((r) => r.numGrades >= 3)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 10)

    console.log(`Completed in ${Date.now() - timer}ms`)
    return topRestaurants
  },

  'restaurants/getTopClever' () {
    const timer = Date.now()

    restaurantsRaw.aggregateSync = Meteor.wrapAsync(restaurantsRaw.aggregate)
    const topRestaurants = restaurantsRaw.aggregateSync([
      { $unwind: '$grades' },
      { $group: { _id: '$restaurant_id', name: { $first: '$name' }, averageScore: { $avg: '$grades.score' }, numGrades: { $sum: 1 } } },
      { $match: { numGrades: { $gte: 3 } } },
      { $sort: { averageScore: -1 } },
      { $limit: 10 }
    ])

    console.log(`Completed in ${Date.now() - timer}ms`)
    return topRestaurants
  }
}

Meteor.methods(methods)

export default methods

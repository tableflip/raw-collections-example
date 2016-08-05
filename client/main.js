import { Meteor } from 'meteor/meteor'
import { Template } from 'meteor/templating'
import { ReactiveVar } from 'meteor/reactive-var'

import './main.html'

Template.rawCollectionTest.onCreated(function () {
  this.restaurants = new ReactiveVar([])
  this.requesting = new ReactiveVar(false)

  this.subscribe('restaurants/count')
})

Template.rawCollectionTest.helpers({
  restaurants: () => Template.instance().restaurants.get(),
  requesting: () => Template.instance().requesting.get(),
  round: (val) => Math.round(val * 100) / 100
})

Template.rawCollectionTest.events({
  'click [data-action="import-basic"]' (evt, tpl) {
    tpl.requesting.set(true)
    const startTime = Date.now()
    Meteor.call('restaurants/importSimple', (err) => {
      tpl.requesting.set(false)
      if (err) return alert(`Error: ${err.message}`)
      alert(`Time taken was ${Date.now() - startTime}ms`)
    })
  },

  'click [data-action="import-bulk"]' (evt, tpl) {
    tpl.requesting.set(true)
    const startTime = Date.now()
    Meteor.call('restaurants/importBulk', (err) => {
      tpl.requesting.set(false)
      if (err) return alert(`Error: ${err.message}`)
      alert(`Time taken was ${Date.now() - startTime}ms`)
    })
  },

  'click [data-action="top-restaurants-basic"]' (evt, tpl) {
    tpl.requesting.set(true)
    tpl.restaurants.set([])
    const startTime = Date.now()
    Meteor.call('restaurants/getTopBasic', (err, restaurants) => {
      tpl.requesting.set(false)
      if (err) return alert(`Error: ${err.message}`)
      tpl.restaurants.set(restaurants)
      alert(`Time taken was ${Date.now() - startTime}ms`)
    })
  },

  'click [data-action="top-restaurants-aggregation"]' (evt, tpl) {
    tpl.requesting.set(true)
    tpl.restaurants.set([])
    const startTime = Date.now()
    Meteor.call('restaurants/getTopAggregation', (err, restaurants) => {
      tpl.requesting.set(false)
      if (err) return alert(`Error: ${err.message}`)
      tpl.restaurants.set(restaurants)
      alert(`Time taken was ${Date.now() - startTime}ms`)
    })    
  }
})
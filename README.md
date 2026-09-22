# FuelLog

Your car's real fuel efficiency, tracked between fill-ups.

**Startup idea:** nobody knows what their car actually does per liter - dashboards lie, brochures lie. A slow efficiency drop is the earliest sign of engine trouble and costs money weekly before anyone notices. FuelLog turns each pump stop (odometer, liters, cost) into real km/L per tank, cost per km, and a trend signal.

## Use

Open `app.html`. Log each fill-up (date, odometer, liters, total cost). From the second fill-up, the stats row shows average and last-tank efficiency, cost per km, and an improving/steady/worsening trend. Odometer entries are validated to increase. Data persists in localStorage.

## Engine

`engine.js` holds the pure logic (segment computation between fill-ups, aggregates, 3%-band trend detection) and is covered by node tests. The UI is a thin render layer over it.

Part of the hourly app factory - 60+ small tools, one per hour.

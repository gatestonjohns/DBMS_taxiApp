// EXPORT FUNCTIONS
module.exports.optimalTimeToDrive = optimalTimeToDrive;
module.exports.loneRidersPercentage = loneRidersPercentage;
module.exports.overallCostWithInflation = overallCostWithInflation;
module.exports.percentGroupRides = percentGroupRides;
module.exports.taxiTravelSpeed = taxiTravelSpeed;
module.exports.tipsPerMile = tipsPerMile;
module.exports.tripTimeLength = tripTimeLength;


// RIDER
//==================================================================================

// What percent of rides are single people?
function loneRidersPercentage(connection, timeDomain) {
    // INITIALIZE EMPTY QUERY
    var q = "";

    timeDomain = timeDomain.toLowerCase();

    // ASSIGN QUERY BASED OFF TIME DOMAIN
    switch (timeDomain) {
        case 'day':
            q = `SELECT ROUND(t2.singleRides / t1.totalRides, 4) AS dailySinglePercentage, t1.day, t1.month, t1.year FROM
                (SELECT COUNT(t.ident) as totalRides, day, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(DAY FROM ta.dropOffTime) as day,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                ) t
                GROUP BY day, month, year) t1,
                (SELECT COUNT(t.ident) as singleRides, day, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(DAY FROM ta.dropOffTime) as day,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                WHERE ta.nPassengers = 1
                ) t
                GROUP BY day, month, year) t2
                WHERE t1.day = t2.day AND t1.month = t2.month AND t1.year = t2.year
                ORDER BY t1.year ASC, t1.month ASC, t1.day ASC`;
            break;
        case 'month':
            q = `SELECT ROUND(t2.singleRides / t1.totalRides, 4) AS monthlySinglePercentage, t1.month, t1.year FROM
                (SELECT COUNT(t.ident) as totalRides, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                ) t
                GROUP BY month, year) t1,
                (SELECT COUNT(t.ident) as singleRides, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                WHERE ta.nPassengers = 1
                ) t
                GROUP BY month, year) t2
                WHERE t1.month = t2.month AND t1.year = t2.year
                ORDER BY t1.year ASC, t1.month ASC`;
            break;

    }

    // RETURN THE RESULT OF THE QUERY
    return connection.execute(q);
};

// What percent of rides are groups (npassengers >= groupThreshold) ? 
function percentGroupRides(connection, timeDomain) {
    // INITIALIZE EMPTY QUERY
    var q = "";

    timeDomain = timeDomain.toLowerCase();

    // ASSIGN QUERY BASED OFF TIME DOMAIN
    switch (timeDomain) {
        case 'day':
            q = `SELECT ROUND(t2.groupRides / t1.totalRides, 4) AS dailyGroupPercentage, t1.day, t1.month, t1.year FROM
                (SELECT COUNT(t.ident) as totalRides, day, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(DAY FROM ta.dropOffTime) as day,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                ) t
                GROUP BY day, month, year) t1,
                (SELECT COUNT(t.ident) as groupRides, day, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(DAY FROM ta.dropOffTime) as day,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                WHERE ta.nPassengers >= 3
                ) t
                GROUP BY day, month, year) t2
                WHERE t1.day = t2.day AND t1.month = t2.month AND t1.year = t2.year
                ORDER BY t1.year ASC, t1.month ASC, t1.day ASC`;
            break;
        case 'month':
            q = `SELECT ROUND(t2.groupRides / t1.totalRides, 4) AS monthlyGroupPercentage, t1.month, t1.year FROM
                (SELECT COUNT(t.ident) as totalRides, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                ) t
                GROUP BY month, year) t1,
                (SELECT COUNT(t.ident) as groupRides, month, year
                FROM
                (
                SELECT ta.tripId as ident,
                EXTRACT(MONTH FROM ta.dropOffTime) as month,
                EXTRACT(YEAR FROM ta.dropOffTime) as year
                FROM TAXICABTRIP ta
                WHERE ta.nPassengers >= 3
                ) t
                GROUP BY month, year) t2
                WHERE t1.month = t2.month AND t1.year = t2.year
                ORDER BY t1.year ASC, t1.month ASC`;
            break;

    }

    // RETURN THE RESULT OF THE QUERY
    return connection.execute(q);
};



// DRIVER
//================================================================================

// What are the average amount of tips per person per mile?
function tipsPerMile(connection, timeDomain) {
    // INITIALIZE EMPTY QUERY
    var q = "";

    timeDomain = timeDomain.toLowerCase();

    // ASSIGN QUERY BASED OFF TIME DOMAIN
    switch (timeDomain) {
        case 'day':
            q = `SELECT AVG(tipcoefficient) as dailyAvgTipCoefficient, day, month, year
                FROM (
                SELECT ROUND(t.tipPerMile / ta.nPassengers, 4) as tipCoefficient,
                EXTRACT(DAY FROM t.timestamp)as day, EXTRACT(MONTH FROM t.timestamp)as month,
                EXTRACT(YEAR FROM t.timestamp)as year
                FROM
                (
                SELECT ROUND(tr.tipAmt / ta.distance, 4) AS tipPerMile,
                ta.dropoffTime AS timestamp, ta.tripId AS ident
                FROM TRIPSPENDING tr, TAXICABTRIP ta
                WHERE tr.paymentId = ta.tripId
                ) t, TAXICABTRIP ta
                WHERE ta.tripId = t.ident AND ta.nPassengers != 0
                )
                GROUP BY day, month, year
                ORDER BY year ASC`;
            break;
        case 'month':
            q = `SELECT AVG(tipcoefficient) as monthlyAvgTipCoefficient, month, year
                FROM (
                SELECT ROUND(t.tipPerMile / ta.nPassengers, 4) as tipCoefficient,
                EXTRACT(DAY FROM t.timestamp)as day, EXTRACT(MONTH FROM t.timestamp)as month,
                EXTRACT(YEAR FROM t.timestamp)as year
                FROM
                (
                SELECT ROUND(tr.tipAmt / ta.distance, 4) AS tipPerMile,
                ta.dropoffTime AS timestamp, ta.tripId AS ident
                FROM TRIPSPENDING tr, TAXICABTRIP ta
                WHERE tr.paymentId = ta.tripId
                ) t, TAXICABTRIP ta
                WHERE ta.tripId = t.ident AND ta.nPassengers != 0
                )
                GROUP BY month, year
                ORDER BY year ASC`;
            break;

    }

    // RETURN THE RESULT OF THE QUERY
    return connection.execute(q);
};

// When is it the optimal time to be a part-time taxi driver during the year?
function optimalTimeToDrive(connection, timeDomain) {
    // INITIALIZE EMPTY QUERY
    var q = "";

    timeDomain = timeDomain.toLowerCase();

    // ASSIGN QUERY BASED OFF TIME DOMAIN
    switch (timeDomain) {
        case 'day':
            q = `SELECT AVG(optimalPartTimeCoefficient) as dailyAvgPartTimeCoefficient, day, month, year
            FROM(
                SELECT ROUND(t.tipPerMile / ta.distance, 4) as optimalPartTimeCoefficient,
                EXTRACT(DAY FROM t.timestamp) as day, EXTRACT(MONTH FROM t.timestamp) as month,
                EXTRACT(YEAR FROM t.timestamp) as year
                FROM
                    (
                        SELECT ROUND(tr.tipAmt / ta.distance, 4) AS tipPerMile,
                        ta.dropoffTime AS timestamp, ta.tripId AS ident
                FROM TRIPSPENDING tr, TAXICABTRIP ta
                WHERE tr.paymentId = ta.tripId
                                    ) t, TAXICABTRIP ta
                WHERE ta.tripId = t.ident
            )
            GROUP BY day, month, year
            ORDER BY year ASC`;
            break;
        case 'month':
            q = `SELECT AVG(optimalPartTimeCoefficient) as dailyAvgPartTimeCoefficient, month, year
                FROM (
                SELECT ROUND(t.tipPerMile / ta.distance, 4) as optimalPartTimeCoefficient,
                EXTRACT(MONTH FROM t.timestamp)as month, EXTRACT(YEAR FROM t.timestamp)as year
                FROM
                (
                SELECT ROUND(tr.tipAmt / ta.distance, 4) AS tipPerMile,
                ta.dropoffTime AS timestamp, ta.tripId AS ident
                FROM TRIPSPENDING tr, TAXICABTRIP ta
                WHERE tr.paymentId = ta.tripId
                ) t, TAXICABTRIP ta
                WHERE ta.tripId = t.ident
                )
                GROUP BY month, year
                ORDER BY year ASC`;
            break;

    }

    // RETURN THE RESULT OF THE QUERY
    return connection.execute(q);
};



// BUSINESS OWNER
//========================================================================

// How does the average trip length vary over the year?
function tripTimeLength(connection, timeDomain) {
    // INITIALIZE EMPTY QUERY
    var q = "";

    timeDomain = timeDomain.toLowerCase();

    // ASSIGN QUERY BASED OFF TIME DOMAIN
    switch (timeDomain) {
        case 'day':
            q = `SELECT AVG(durationInSeconds) as dailyAvgTripDurationInSecs, day, month, year
                FROM
                (
                SELECT ABS(t1.dropoffTime - t2.pickupTime) * 86400 AS durationInSeconds,
                EXTRACT(DAY FROM t1.dropOffTime) as day,
                EXTRACT(MONTH FROM t1.dropOffTime) as month,
                EXTRACT(YEAR FROM t1.dropOffTime) as year
                FROM TAXICABTRIP t1, TAXICABTRIP t2
                where t1.tripId = t2.tripId
                )
                GROUP BY day, month, year
                ORDER BY year ASC`;
            break;
        case 'month':
            q = `SELECT AVG(durationInSeconds) as monthlyAvgTripDurationInSecs, month, year
                FROM
                (
                SELECT ABS(t1.dropoffTime - t2.pickupTime) * 86400 AS durationInSeconds,
                EXTRACT(MONTH FROM t1.dropOffTime) as month,
                EXTRACT(YEAR FROM t1.dropOffTime) as year
                FROM TAXICABTRIP t1, TAXICABTRIP t2
                where t1.tripId = t2.tripId
                )
                GROUP BY month, year
                ORDER BY year ASC`;
            break;

    }

    // RETURN THE RESULT OF THE QUERY
    return connection.execute(q);
};

// How have taxi rates changed in value (with respect to inflation)?
function overallCostWithInflation(connection, timeDomain) {
    // INITIALIZE EMPTY QUERY
    var q = "";

    timeDomain = timeDomain.toLowerCase();

    // ASSIGN QUERY BASED OFF TIME DOMAIN
    switch (timeDomain) {
        case 'day':
            q = `SELECT AVG(adjustedFare) as dailyAvgFare, day, month, year
                FROM
                (
                SELECT ROUND((ts.fareAmt * nv.amount2022) / t1.distance, 4) as adjustedFare,
                EXTRACT(DAY FROM t1.dropOffTime) as day,
                EXTRACT(MONTH FROM t1.dropOffTime) as month,
                EXTRACT(YEAR FROM t1.dropOffTime) as year
                FROM TRIPSPENDING ts, TAXICABTRIP t1, NORMVALUE nv
                WHERE EXTRACT(YEAR FROM t1.dropOffTime) = nv.year_val AND t1.tripId = ts.paymentId
                )
                GROUP BY day, month, year
                ORDER BY year ASC`;
            break;
        case 'month':
            q = `SELECT AVG(adjustedFare) as monthlyAvgFare, month, year
                FROM
                (
                SELECT ROUND((ts.fareAmt * nv.amount2022) / t1.distance, 4) as adjustedFare,
                EXTRACT(MONTH FROM t1.dropOffTime) as month,
                EXTRACT(YEAR FROM t1.dropOffTime) as year
                FROM TRIPSPENDING ts, TAXICABTRIP t1, NORMVALUE nv
                WHERE EXTRACT(YEAR FROM t1.dropOffTime) = nv.year_val AND t1.tripId = ts.paymentId
                )
                GROUP BY month, year
                ORDER BY year ASC`;
            break;

    }

    // RETURN THE RESULT OF THE QUERY
    return connection.execute(q);
};

// What is the average speed of a taxi during a service trip?
function taxiTravelSpeed(connection, timeDomain) {
    // INITIALIZE EMPTY QUERY
    var q = "";

    timeDomain = timeDomain.toLowerCase();

    // ASSIGN QUERY BASED OFF TIME DOMAIN
    switch (timeDomain) {
        case 'day':
            q = `SELECT AVG(milesPerHour), day, month, year
                FROM
                (
                SELECT ROUND(t1.distance / (ABS(t1.dropoffTime - t2.pickupTime) * 24), 4)
                AS milesPerHour,
                EXTRACT(DAY FROM t1.dropOffTime) as day,
                EXTRACT(MONTH FROM t1.dropOffTime) as month,
                EXTRACT(YEAR FROM t1.dropOffTime) as year
                FROM TAXICABTRIP t1, TAXICABTRIP t2
                where t1.tripId = t2.tripId AND t1.dropoffTime - t2.pickupTime != 0
                )
                GROUP BY day, month, year
                ORDER BY year ASC`;
            break;
        case 'month':
            q = `SELECT AVG(milesPerHour), month, year
                FROM
                (
                SELECT ROUND(t1.distance / (ABS(t1.dropoffTime - t2.pickupTime) * 24), 4)
                AS milesPerHour,
                EXTRACT(MONTH FROM t1.dropOffTime) as month,
                EXTRACT(YEAR FROM t1.dropOffTime) as year
                FROM TAXICABTRIP t1, TAXICABTRIP t2
                where t1.tripId = t2.tripId AND t1.dropoffTime - t2.pickupTime != 0
                )
                GROUP BY month, year
                ORDER BY year ASC`;
            break;

    }

    // RETURN THE RESULT OF THE QUERY
    return connection.execute(q);
};




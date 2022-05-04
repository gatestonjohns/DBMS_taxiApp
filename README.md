### DBMS Taxilytics App

##This data is stored in an OracleDB, queried in NodeJS, passed in using EJS and formatted as a chart using ChartJS.

#\#NodeJS
#\#ExpressAppPkg
#\#OracleSQL
#\#OracleDBpkg
#\#EJS

This app uses a sampling of 7.8 million rows of taxicab trip data from the years of 2018-2020. 
This data was downloaded from https://www1.nyc.gov/site/tlc/about/tlc-trip-record-data.page . 
This data was then sampled (~5%) using a Python script and Pandas. 
The data was then cleaned using a combination of SQL scripts.

Excuse the app's appearance, I did not want to spend the unecessary time learning enough CSS to make it look pretty.

\* **This app is not published on the public internet and cannot be locally hosted by anyone without a UF gatorlink account.**
For this reason, some sample screenshots are posted below:

Home page:
![image](https://user-images.githubusercontent.com/68303855/166615705-fd1c38a6-1df5-473e-9aa6-0845038c2767.png)

Taxi Drivers page (example query):
![image](https://user-images.githubusercontent.com/68303855/166615771-6d2bd0f7-7e1c-470e-aa75-33d320936c4f.png)

Business Owners page (sample query):
![image](https://user-images.githubusercontent.com/68303855/166615928-94bee129-56d9-4c72-9193-bccedfbc9e46.png)

Riders page (sample query):
![image](https://user-images.githubusercontent.com/68303855/166615991-9c3f60c2-f155-436f-9f6c-d7151544b2db.png)

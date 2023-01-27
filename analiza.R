# library 
install.packages('dplyr')
library(dplyr)
install.packages('tidyr')
library(tidyr)
install.packages('Hmisc')
library(Hmisc)

data$priceSQM <- data$Price.zł. / data$Area.m.2.


detect_outlier <- function(x) {
  Quantile1 <- quantile(x, probs=.25)
  
  Quantile3 <- quantile(x, probs=.75)
  
  IQR = Quantile3-Quantile1

  x > Quantile3 + (IQR*1.5) | x < Quantile1 - (IQR*1.5)
}

remove_outlier <- function(dataframe,
                            columns=names(dataframe)) {
  for (col in columns) {
    dataframe <- dataframe[!detect_outlier(dataframe[[col]]), ]
  }
  
return(dataframe)
}

data$NumberOfRooms<-as.numeric(data$NumberOfRooms)

data_without_NA<-na.omit(data)

data_without_outlier<-remove_outlier(data_without_NA, c('priceSQM','Price.zł.','Area.m.2.'));
boxplot(data_without_outlier$Price.zł.)
boxplot(data_without_outlier$priceSQM)
boxplot(data_without_outlier$Area.m.2.)

summary(data_without_outlier)


hist(data_without_outlier$Price.zł.)
hist(data_without_outlier$NumberOfRooms)
hist(data_without_outlier$Area.m.2.)
hist(data_without_outlier$priceSQM)

for(i in 1:nrow(data_without_outlier)){
  if(data_without_outlier$Price.zł.[i] == 115000){
    print(i)
  }
}

print(data_without_outlier[221,])

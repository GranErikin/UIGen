FROM node

WORKDIR /app

ADD . /app

RUN mv /app/lib/jre-8u211-linux-x64.tar.gz /java.tar.gz
RUN mkdir /home/java
RUN tar -xzvf /java.tar.gz -C /home/java
RUN rm /java.tar.gz

ENV JAVA_HOME="/home/java/jre1.8.0_211"
ENV PATH="${PATH}:$JAVA_HOME/bin"

RUN mv /app/lib/apache-groovy-binary-2.5.7.zip /groovy.zip
RUN unzip /groovy.zip -d /home/groovy
RUN rm /groovy.zip

ENV GROOVY_HOME="/home/groovy/groovy-2.5.7"
ENV PATH="${PATH}:$GROOVY_HOME/bin"

RUN npm install
EXPOSE 8081

CMD ["node", "index.js"]
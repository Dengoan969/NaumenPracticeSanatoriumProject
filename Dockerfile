FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --production=false
COPY frontend/ .
RUN npm run build

FROM eclipse-temurin:21-jdk-alpine AS backend-build
WORKDIR /backend
COPY pom.xml ./
RUN mvn dependency:go-offline -q
COPY src/ ./src/
RUN mvn package -DskipTests -q

FROM eclipse-temurin:21-jre-alpine AS runtime
ENV SPRING_PROFILES_ACTIVE=production
ENV SERVER_PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=backend-build /backend/target/*.jar app.jar

RUN mkdir -p /app/static
COPY --from=frontend-build /frontend/build/ /app/static/

RUN mkdir -p /app/uploads/news && chown -R appuser:appgroup /app

EXPOSE 8080

USER appuser

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

FROM node:24-bookworm-slim
# Compilers and runtimes for every language in languages.js (Node.js comes with the base image).
RUN apt-get update && apt-get install -y --no-install-recommends \
        gcc g++ libc6-dev \
        python3 \
        default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

# Speed-ups built once into the image and picked up by languages.js:
#  - a precompiled <bits/stdc++.h> (C++ compiles 2.0 s -> 0.5 s); its flags must match the C++ compile command
#  - a class-data archive of javac's own classes (javac 1.4 s -> 0.6 s); its -J flags must match the Java compile command
RUN mkdir -p /opt/gms && cd /opt/gms \
    && echo '#include <bits/stdc++.h>' > gms_cpp.h \
    && g++ -O2 -std=c++17 -x c++-header gms_cpp.h -o gms_cpp.h.gch \
    && mkdir /tmp/cds && cd /tmp/cds \
    && echo 'public class Main { public static void main(String[] a) { System.out.println(new java.util.Scanner(System.in).nextLine()); } }' > Main.java \
    && javac -J-Xmx256m -J-XX:+UseSerialGC -J-XX:TieredStopAtLevel=1 -J-XX:ArchiveClassesAtExit=/opt/gms/javac.jsa Main.java \
    && cd / && rm -rf /tmp/cds

WORKDIR /app
COPY . .
RUN useradd -m runner && chown -R runner /app
USER runner
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]

rm juho\Main.class
rm Main.jar

javac juho\*.java
javap -cp . -c juho.Main > bytecode.txt
jar cfe Main.jar juho.Main juho\*.class
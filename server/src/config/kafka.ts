import { Kafka, Producer, Consumer } from 'kafkajs';

class KafkaService {
  private kafka: Kafka;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'quizara',
      brokers: ['localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  async connectProducer() {
    try {
      this.producer = this.kafka.producer();
      await this.producer.connect();
      console.log('✅ Kafka Producer connected');
    } catch (error) {
      console.error('❌ Kafka Producer connection failed:', error);
      setTimeout(() => this.connectProducer(), 5000);
    }
  }

  async connectConsumer(groupId: string) {
    try {
      this.consumer = this.kafka.consumer({ groupId });
      await this.consumer.connect();
      console.log('✅ Kafka Consumer connected');
    } catch (error) {
      console.error('❌ Kafka Consumer connection failed:', error);
      setTimeout(() => this.connectConsumer(groupId), 5000);
    }
  }

  // Produce event to Kafka
  async produceEvent(topic: string, event: any) {
    if (!this.producer) {
      await this.connectProducer();
    }

    try {
      await this.producer!.send({
        topic,
        messages: [
          {
            key: event.eventId || event.gameId || event.playerId,
            value: JSON.stringify({
              ...event,
              timestamp: Date.now(),
            }),
          },
        ],
      });

      console.log(`📤 Kafka: Produced to ${topic}:`, event.type);
    } catch (error) {
      console.error('Kafka produce error:', error);
    }
  }

  // Consume events from Kafka
  async consumeEvents(topic: string, callback: (event: any) => void) {
    if (!this.consumer) {
      await this.connectConsumer('quizara-consumer-group');
    }

    await this.consumer!.subscribe({ topic, fromBeginning: false });

    await this.consumer!.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(message.value!.toString());
        console.log(`📥 Kafka: Consumed from ${topic}:`, event.type);
        callback(event);
      },
    });
  }

  async disconnect() {
    await this.producer?.disconnect();
    await this.consumer?.disconnect();
  }
}

export default new KafkaService();
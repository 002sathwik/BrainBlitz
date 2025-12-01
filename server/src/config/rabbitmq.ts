import * as amqp from 'amqplib';

class RabbitMQService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private readonly url = 'amqp://localhost:5672';

  async connect() {
    try {
      this.connection = (await amqp.connect(this.url)) as unknown as amqp.Connection;
      this.channel = await (this.connection as unknown as { createChannel(): Promise<amqp.Channel> }).createChannel();

      console.log('✅ RabbitMQ connected');

      this.connection.on('error', (err) => {
        console.error('❌ RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        console.log('⚠️ RabbitMQ connection closed, reconnecting...');
        setTimeout(() => this.connect(), 5000);
      });

    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async getChannel(): Promise<amqp.Channel> {
    if (!this.channel) {
      await this.connect();
    }
    return this.channel!;
  }

  async publish(exchange: string, routingKey: string, message: any) {
    try {
      const channel = await this.getChannel();

      await channel.assertExchange(exchange, 'topic', { durable: false });

      channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(message))
      );

      console.log(`📤 Published to ${exchange}.${routingKey}:`, message);
    } catch (error) {
      console.error('Error publishing message:', error);
    }
  }

  async subscribe(
    exchange: string,
    routingKey: string,
    callback: (message: any) => void
  ) {
    try {
      const channel = await this.getChannel();

      await channel.assertExchange(exchange, 'topic', { durable: false });

      const q = await channel.assertQueue('', { exclusive: true });

      await channel.bindQueue(q.queue, exchange, routingKey);

      console.log(`📥 Subscribed to ${exchange}.${routingKey}`);

      channel.consume(
        q.queue,
        (msg) => {
          if (msg) {
            const content = JSON.parse(msg.content.toString());
            callback(content);
            channel.ack(msg);
          }
        },
        { noAck: false }
      );
    } catch (error) {
      console.error('Error subscribing to messages:', error);
    }
  }

  async close() {
    await this.channel?.close();
    await (this.connection as any)?.close?.();
  }
}

export default new RabbitMQService();
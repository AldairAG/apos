import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class CocinaSocket {

    private client: Client | null = null;

    conectar(
        sucursalId: number,
        onOrdenCreada: (orden: any) => void
    ) {

        const socket = new SockJS(
            "http://localhost:8080/ws"
        );

        this.client = new Client({

            webSocketFactory: () => socket,

            debug: (str) => {
                console.log("STOMP:", str);
            },

            onConnect: () => {


                this.client?.subscribe(
                    `/topic/cocina/${sucursalId}`,
                    (message) => {

                        const orden =
                            JSON.parse(message.body);

                        onOrdenCreada(orden);
                    }
                );
            },

        });

        this.client.activate();
    }

    desconectar() {
        this.client?.deactivate();
    }
}

export default new CocinaSocket();
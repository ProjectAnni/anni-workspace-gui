import { ipcMain, IpcMainInvokeEvent } from "electron";
import axios, { AxiosRequestConfig } from "axios";

class RequestModule {
    listen() {
        ipcMain.handle("request", this.request);
        ipcMain.handle("request:get", this.get);
        ipcMain.handle("request:post", this.post);
    }

    request(e: IpcMainInvokeEvent, config: AxiosRequestConfig) {
        return axios(config);
    }

    async get(e: IpcMainInvokeEvent, url: string, config: AxiosRequestConfig) {
        const response = await axios.get(url, config);
        return response.data;
    }

    async post(e: IpcMainInvokeEvent, url: string, config: AxiosRequestConfig) {
        const response = await axios.post(url, config);
        return response.data;
    }
}

export default RequestModule;

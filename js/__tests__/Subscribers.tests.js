import Subscribers from "../Subscribers";
import {jest} from "@jest/globals";

describe('Subscribers', () => {
    test('should accept subscribers', () => {
        const sub = new Subscribers(1);
        const cb = jest.fn((pub) => pub)

        sub.subscribe('event', cb);
        sub.notify('event');

        expect(cb).toBeCalled();
        expect(cb.mock.results[0].value).toBe(1);
    });
});
version 0.1
1. install 'bencode', 'bn.js' , 'save-buffer'

2. To run the client,
	a)first go to the directory with torrent file source code in the 	terminal 
	b) enter command: node index.js <file path of torrent metadata file>

3. tracker.js -> line 15: increment index if no response/blank peer list is received. Set index 0 initially if default doesn't work(default is 5)

4. There is scope for improvement that we have recognised and are planning to work on in the future like:
	 a) iteration over index of announce list(urls) 
	 b) download speed can be improed by improving the algorithm to 		 request pieces(need more time for it)